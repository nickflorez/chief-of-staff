import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createChatCompletion, buildSystemPrompt } from "@/lib/ai/claude";
import { createServerSupabaseClient } from "@/lib/db/supabase";

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

    // Build conversation history
    const messages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Get AI response with user's custom settings
    const systemPrompt = buildSystemPrompt(assistantName, personality, timezone);
    const response = await createChatCompletion({
      messages,
      systemPrompt,
      maxTokens: 4096,
    });

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
        content: response.content,
        tokens_in: response.usage?.inputTokens || null,
        tokens_out: response.usage?.outputTokens || null,
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

    return NextResponse.json({
      content: response.content,
      usage: response.usage,
      sessionId,
    });
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
