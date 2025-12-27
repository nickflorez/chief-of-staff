import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (uses service role key)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Database types
export interface UserSettings {
  id: string;
  clerk_user_id: string;
  assistant_name: string;
  assistant_personality: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  clerk_user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
}

export interface UserMemory {
  id: string;
  clerk_user_id: string;
  category: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}
