"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient, ChatSession, ChatMessage } from "@/lib/db/supabase";
import { revalidatePath } from "next/cache";

export interface SessionWithPreview extends ChatSession {
  message_count: number;
  last_message_preview: string | null;
  last_message_at: string | null;
}

export interface SessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

/**
 * Generate a title from the first user message
 */
function generateTitleFromMessage(message: string): string {
  // Truncate to first 50 characters and add ellipsis if needed
  const truncated = message.slice(0, 50);
  return message.length > 50 ? `${truncated}...` : truncated;
}

/**
 * Create a new chat session
 */
export async function createSession(firstMessage?: string): Promise<{ session: ChatSession | null; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { session: null, error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  const title = firstMessage ? generateTitleFromMessage(firstMessage) : null;

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      clerk_user_id: userId,
      title,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return { session: null, error: "Failed to create session" };
  }

  revalidatePath("/history");

  return { session: data as ChatSession };
}

/**
 * Get all sessions for the current user with message counts and previews
 */
export async function getSessions(): Promise<{ sessions: SessionWithPreview[]; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { sessions: [], error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  // Get all sessions for the user
  const { data: sessions, error: sessionsError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("updated_at", { ascending: false });

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
    return { sessions: [], error: "Failed to fetch sessions" };
  }

  if (!sessions || sessions.length === 0) {
    return { sessions: [] };
  }

  // Get message counts and last messages for each session
  const sessionsWithPreviews: SessionWithPreview[] = await Promise.all(
    sessions.map(async (session) => {
      // Get message count
      const { count } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", session.id);

      // Get last message
      const { data: lastMessage } = await supabase
        .from("chat_messages")
        .select("content, created_at")
        .eq("session_id", session.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...session,
        message_count: count || 0,
        last_message_preview: lastMessage?.content
          ? lastMessage.content.slice(0, 100) + (lastMessage.content.length > 100 ? "..." : "")
          : null,
        last_message_at: lastMessage?.created_at || null,
      } as SessionWithPreview;
    })
  );

  return { sessions: sessionsWithPreviews };
}

/**
 * Get a single session with all its messages
 */
export async function getSession(sessionId: string): Promise<{ session: SessionWithMessages | null; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { session: null, error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  // Get the session
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("clerk_user_id", userId)
    .single();

  if (sessionError) {
    if (sessionError.code === "PGRST116") {
      return { session: null, error: "Session not found" };
    }
    console.error("Error fetching session:", sessionError);
    return { session: null, error: "Failed to fetch session" };
  }

  // Get all messages for the session
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    return { session: null, error: "Failed to fetch messages" };
  }

  return {
    session: {
      ...session,
      messages: messages || [],
    } as SessionWithMessages,
  };
}

/**
 * Delete a chat session and all its messages
 */
export async function deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  // Verify the session belongs to the user
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("clerk_user_id", userId)
    .single();

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  // Delete messages first (foreign key constraint)
  const { error: messagesError } = await supabase
    .from("chat_messages")
    .delete()
    .eq("session_id", sessionId);

  if (messagesError) {
    console.error("Error deleting messages:", messagesError);
    return { success: false, error: "Failed to delete messages" };
  }

  // Delete the session
  const { error: sessionError } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);

  if (sessionError) {
    console.error("Error deleting session:", sessionError);
    return { success: false, error: "Failed to delete session" };
  }

  revalidatePath("/history");

  return { success: true };
}

/**
 * Update session title
 */
export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("chat_sessions")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Error updating session title:", error);
    return { success: false, error: "Failed to update session title" };
  }

  revalidatePath("/history");
  revalidatePath(`/history/${sessionId}`);

  return { success: true };
}

/**
 * Save a message to a session
 */
export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  tokensIn?: number,
  tokensOut?: number
): Promise<{ message: ChatMessage | null; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { message: null, error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  // Verify the session belongs to the user
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("clerk_user_id", userId)
    .single();

  if (!session) {
    return { message: null, error: "Session not found" };
  }

  // Insert the message
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      role,
      content,
      tokens_in: tokensIn || null,
      tokens_out: tokensOut || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving message:", error);
    return { message: null, error: "Failed to save message" };
  }

  // Update session's updated_at timestamp
  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  return { message: data as ChatMessage };
}
