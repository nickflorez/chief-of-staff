import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createChatCompletion, buildSystemPrompt } from "@/lib/ai/claude";
import { createServerSupabaseClient } from "@/lib/db/supabase";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get user settings from database
    const supabase = createServerSupabaseClient();
    const { data: settings } = await supabase
      .from("user_settings")
      .select("assistant_name, assistant_personality, timezone")
      .eq("clerk_user_id", userId)
      .single();

    const assistantName = settings?.assistant_name || "Chief of Staff";
    const personality = settings?.assistant_personality || null;
    const timezone = settings?.timezone || "America/Phoenix";

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
