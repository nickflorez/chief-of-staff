"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient, UserSettings } from "@/lib/db/supabase";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/crypto/encryption";
import { verifyApiKey } from "@/lib/integrations/fireflies-client";

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

/**
 * Save Fireflies API key (encrypted)
 */
export async function saveFirefliesApiKey(
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify the API key is valid
  const isValid = await verifyApiKey(apiKey);
  if (!isValid) {
    return { success: false, error: "Invalid API key. Please check your Fireflies API key and try again." };
  }

  const supabase = createServerSupabaseClient();

  // Encrypt the API key before storing
  const encryptedKey = encrypt(apiKey);

  // Upsert the settings with the API key
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        clerk_user_id: userId,
        fireflies_api_key: encryptedKey,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "clerk_user_id",
      }
    );

  if (error) {
    console.error("Error saving Fireflies API key:", error);
    return { success: false, error: "Failed to save API key" };
  }

  revalidatePath("/settings");
  revalidatePath("/chat");

  return { success: true };
}

/**
 * Get decrypted Fireflies API key
 */
export async function getFirefliesApiKey(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("fireflies_api_key")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !data?.fireflies_api_key) {
    return null;
  }

  // Decrypt the API key
  try {
    return decrypt(data.fireflies_api_key);
  } catch {
    console.error("Error decrypting Fireflies API key");
    return null;
  }
}

/**
 * Check if user has Fireflies connected
 */
export async function hasFirefliesConnection(): Promise<boolean> {
  const apiKey = await getFirefliesApiKey();
  return !!apiKey;
}

/**
 * Remove Fireflies API key
 */
export async function removeFirefliesApiKey(): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("user_settings")
    .update({
      fireflies_api_key: null,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Error removing Fireflies API key:", error);
    return { success: false, error: "Failed to remove API key" };
  }

  revalidatePath("/settings");
  revalidatePath("/chat");

  return { success: true };
}
