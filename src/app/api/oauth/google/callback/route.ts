import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GOOGLE_OAUTH_CONFIG } from "@/lib/integrations/oauth-config";
import { encrypt } from "@/lib/crypto/encryption";
import { createServerSupabaseClient } from "@/lib/db/supabase";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL("/sign-in?error=unauthorized", request.url)
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?error=missing_params", request.url)
    );
  }

  // Verify state parameter
  try {
    const stateData = JSON.parse(
      Buffer.from(state, "base64url").toString("utf8")
    );

    if (stateData.userId !== userId) {
      console.error("State userId mismatch");
      return NextResponse.redirect(
        new URL("/settings?error=invalid_state", request.url)
      );
    }
  } catch {
    console.error("Invalid state parameter");
    return NextResponse.redirect(
      new URL("/settings?error=invalid_state", request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_OAUTH_CONFIG.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_OAUTH_CONFIG.getRedirectUri(),
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL("/settings?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Get user info (email) from Google
    const userInfoResponse = await fetch(GOOGLE_OAUTH_CONFIG.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    let connectedEmail = null;
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      connectedEmail = userInfo.email;
    }

    // Calculate token expiration time
    const tokenExpiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null;

    // Store in database
    const supabase = createServerSupabaseClient();

    const { error: dbError } = await supabase.from("user_integrations").upsert(
      {
        clerk_user_id: userId,
        provider: "google",
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: tokenExpiresAt,
        scopes: GOOGLE_OAUTH_CONFIG.scopes,
        connected_email: connectedEmail,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "clerk_user_id,provider",
      }
    );

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.redirect(
        new URL("/settings?error=database_error", request.url)
      );
    }

    // Success - redirect back to settings
    return NextResponse.redirect(
      new URL("/settings?success=google_connected", request.url)
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/settings?error=unknown_error", request.url)
    );
  }
}
