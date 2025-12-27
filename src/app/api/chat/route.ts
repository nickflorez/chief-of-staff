import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  createChatCompletionWithTools,
  buildSystemPrompt,
  extractTextFromContent,
  hasToolUse,
  extractToolUseBlocks,
  MessageContent,
} from "@/lib/ai/claude";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import {
  getAvailableTools,
  getIntegrationsSummary,
  handleToolCall,
  formatToolResultForClaude,
} from "@/lib/ai/tools";

// Maximum number of tool use iterations to prevent infinite loops
const MAX_TOOL_ITERATIONS = 10;

/**
 * Generate a title from the first user message
 */
function generateTitleFromMessage(message: string): string {
  const truncated = message.slice(0, 50);
  return message.length > 50 ? `${truncated}...` : truncated;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { message, history = [], sessionId: providedSessionId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Get user settings from database
    const { data: settings } = await supabase
      .from("user_settings")
      .select("assistant_name, assistant_personality, timezone")
      .eq("clerk_user_id", userId)
      .single();

    const assistantName = settings?.assistant_name || "Chief of Staff";
    const personality = settings?.assistant_personality || null;
    const timezone = settings?.timezone || "America/Phoenix";

    // Handle session - create new or verify existing
    let sessionId = providedSessionId;

    if (!sessionId) {
      // Create a new session
      const title = generateTitleFromMessage(message);
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          clerk_user_id: userId,
          title,
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Error creating session:", sessionError);
        return NextResponse.json(
          { error: "Failed to create session" },
          { status: 500 }
        );
      }

      sessionId = newSession.id;
    } else {
      // Verify the session belongs to the user
      const { data: existingSession } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("clerk_user_id", userId)
        .single();

      if (!existingSession) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
    }

    // Get available tools based on user's integrations
    const [tools, integrationsSummary] = await Promise.all([
      getAvailableTools(userId),
      getIntegrationsSummary(userId),
    ]);

    // Build system prompt with integration info
    const systemPrompt = buildSystemPrompt(
      assistantName,
      personality,
      timezone,
      integrationsSummary
    );

    // Build conversation history in Anthropic format
    const messages: Anthropic.Messages.MessageParam[] = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Track total token usage
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // Get initial AI response
    let response = await createChatCompletionWithTools({
      messages,
      systemPrompt,
      tools,
      maxTokens: 4096,
    });

    totalInputTokens += response.usage.inputTokens;
    totalOutputTokens += response.usage.outputTokens;

    // Handle tool use in a loop
    let iterations = 0;
    let currentMessages = [...messages];
    let currentContent = response.content;

    while (hasToolUse(currentContent) && iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      // Extract tool use blocks
      const toolUseBlocks = extractToolUseBlocks(currentContent);

      // Add assistant message with tool use to conversation
      currentMessages.push({
        role: "assistant",
        content: currentContent,
      });

      // Process each tool call and collect results
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          const result = await handleToolCall(
            userId,
            toolUse.name,
            toolUse.input as Record<string, unknown>
          );

          return {
            type: "tool_result" as const,
            tool_use_id: toolUse.id,
            content: formatToolResultForClaude(result),
            is_error: !result.success,
          };
        })
      );

      // Add tool results to conversation
      currentMessages.push({
        role: "user",
        content: toolResults,
      });

      // Get next response
      response = await createChatCompletionWithTools({
        messages: currentMessages,
        systemPrompt,
        tools,
        maxTokens: 4096,
      });

      totalInputTokens += response.usage.inputTokens;
      totalOutputTokens += response.usage.outputTokens;
      currentContent = response.content;
    }

    // Extract final text response
    const finalText = extractTextFromContent(currentContent);

    // Save user message to database
    const { error: userMsgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role: "user",
        content: message,
      });

    if (userMsgError) {
      console.error("Error saving user message:", userMsgError);
      // Continue anyway - message was processed
    }

    // Save assistant message to database
    const { error: assistantMsgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role: "assistant",
        content: finalText,
        tokens_in: totalInputTokens,
        tokens_out: totalOutputTokens,
      });

    if (assistantMsgError) {
      console.error("Error saving assistant message:", assistantMsgError);
      // Continue anyway - message was processed
    }

    // Update session's updated_at timestamp
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    // Build response with tool use info if applicable
    const responseData: {
      content: string;
      usage: { inputTokens: number; outputTokens: number };
      sessionId: string;
      toolsUsed?: string[];
    } = {
      content: finalText,
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
      sessionId,
    };

    // Include which tools were used (for debugging/transparency)
    if (iterations > 0) {
      const allToolUses = extractAllToolUses(currentMessages);
      if (allToolUses.length > 0) {
        responseData.toolsUsed = allToolUses;
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Chat API error:", error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("ANTHROPIC_API_KEY")) {
        return NextResponse.json(
          { error: "AI service not configured" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

/**
 * Extract all tool names used from the conversation
 */
function extractAllToolUses(messages: Anthropic.Messages.MessageParam[]): string[] {
  const toolNames: string[] = [];

  for (const msg of messages) {
    if (msg.role === "assistant" && Array.isArray(msg.content)) {
      for (const block of msg.content as MessageContent[]) {
        if (block.type === "tool_use") {
          toolNames.push(block.name);
        }
      }
    }
  }

  return [...new Set(toolNames)]; // Return unique tool names
}
