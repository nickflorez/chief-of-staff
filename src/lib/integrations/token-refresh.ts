import { createServerSupabaseClient, UserIntegration } from "@/lib/db/supabase";
import { encrypt, decrypt } from "@/lib/crypto/encryption";
import { GOOGLE_OAUTH_CONFIG, ASANA_OAUTH_CONFIG } from "./oauth-config";

/**
 * Get a valid access token for an integration, refreshing if necessary
 */
export async function getValidAccessToken(
  userId: string,
  provider: "google" | "asana"
): Promise<string | null> {
  const supabase = createServerSupabaseClient();

  const { data: integration, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("provider", provider)
    .single();

  if (error || !integration) {
    console.error(`No ${provider} integration found for user:`, userId);
    return null;
  }

  const typedIntegration = integration as UserIntegration;

  // Check if token is expired or will expire soon (within 5 minutes)
  const now = new Date();
  const expiresAt = typedIntegration.token_expires_at
    ? new Date(typedIntegration.token_expires_at)
    : null;
  const isExpired = expiresAt && expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;

  if (isExpired && typedIntegration.refresh_token) {
    // Refresh the token
    const newTokens = await refreshAccessToken(
      provider,
      decrypt(typedIntegration.refresh_token)
    );

    if (newTokens) {
      // Update the database with new tokens
      const encryptedAccessToken = encrypt(newTokens.access_token);
      const encryptedRefreshToken = newTokens.refresh_token
        ? encrypt(newTokens.refresh_token)
        : typedIntegration.refresh_token;

      const tokenExpiresAt = newTokens.expires_in
        ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
        : null;

      await supabase
        .from("user_integrations")
        .update({
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", userId)
        .eq("provider", provider);

      return newTokens.access_token;
    }

    // Refresh failed - return null to indicate re-auth needed
    console.error(`Token refresh failed for ${provider}`);
    return null;
  }

  // Token is still valid
  return decrypt(typedIntegration.access_token);
}

async function refreshAccessToken(
  provider: "google" | "asana",
  refreshToken: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number } | null> {
  try {
    const config = provider === "google" ? GOOGLE_OAUTH_CONFIG : ASANA_OAUTH_CONFIG;

    const response = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token refresh failed for ${provider}:`, errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error refreshing ${provider} token:`, error);
    return null;
  }
}

/**
 * Check if a user has a valid connection to a provider
 */
export async function hasValidConnection(
  userId: string,
  provider: "google" | "asana"
): Promise<boolean> {
  const token = await getValidAccessToken(userId, provider);
  return !!token;
}
