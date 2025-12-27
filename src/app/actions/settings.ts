"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient, UserSettings } from "@/lib/db/supabase";
import { revalidatePath } from "next/cache";

export type SettingsFormData = {
  assistantName: string;
  assistantPersonality: string | null;
  timezone: string;
};

export async function getUserSettings(): Promise<UserSettings | null> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is OK for new users
    console.error("Error fetching user settings:", error);
    throw new Error("Failed to fetch settings");
  }

  return data as UserSettings | null;
}

export async function saveUserSettings(formData: SettingsFormData): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  // Upsert the settings (insert if not exists, update if exists)
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        clerk_user_id: userId,
        assistant_name: formData.assistantName,
        assistant_personality: formData.assistantPersonality || null,
        timezone: formData.timezone,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "clerk_user_id",
      }
    );

  if (error) {
    console.error("Error saving user settings:", error);
    return { success: false, error: "Failed to save settings" };
  }

  revalidatePath("/settings");
  revalidatePath("/chat");

  return { success: true };
}
