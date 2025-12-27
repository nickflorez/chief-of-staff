import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createChatCompletion, buildSystemPrompt } from "@/lib/ai/claude";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { message, history = [], assistantName = "Chief of Staff", personality } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build conversation history
    const messages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Get AI response
    const systemPrompt = buildSystemPrompt(assistantName, personality);
    const response = await createChatCompletion({
      messages,
      systemPrompt,
      maxTokens: 4096,
    });

    return NextResponse.json({
      content: response.content,
      usage: response.usage,
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
