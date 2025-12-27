"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient, UserIntegration } from "@/lib/db/supabase";
import { revalidatePath } from "next/cache";

export type IntegrationStatus = {
  provider: "google" | "asana";
  connected: boolean;
  connectedEmail: string | null;
  connectedAt: string | null;
};

export async function getUserIntegrations(): Promise<IntegrationStatus[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("user_integrations")
    .select("provider, connected_email, created_at")
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Error fetching integrations:", error);
    throw new Error("Failed to fetch integrations");
  }

  // Build status for all providers
  const integrations = data as Pick<
    UserIntegration,
    "provider" | "connected_email" | "created_at"
  >[];

  const providers: ("google" | "asana")[] = ["google", "asana"];

  return providers.map((provider) => {
    const integration = integrations.find((i) => i.provider === provider);
    return {
      provider,
      connected: !!integration,
      connectedEmail: integration?.connected_email || null,
      connectedAt: integration?.created_at || null,
    };
  });
}

export async function disconnectIntegration(
  provider: "google" | "asana"
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("user_integrations")
    .delete()
    .eq("clerk_user_id", userId)
    .eq("provider", provider);

  if (error) {
    console.error("Error disconnecting integration:", error);
    return { success: false, error: "Failed to disconnect integration" };
  }

  revalidatePath("/settings");

  return { success: true };
}

// Check if OAuth credentials are configured
export async function getOAuthAvailability(): Promise<{
  google: boolean;
  asana: boolean;
}> {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    asana: !!(process.env.ASANA_CLIENT_ID && process.env.ASANA_CLIENT_SECRET),
  };
}
