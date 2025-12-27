import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GOOGLE_OAUTH_CONFIG } from "@/lib/integrations/oauth-config";
import { randomBytes } from "crypto";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GOOGLE_OAUTH_CONFIG.clientId) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 500 }
    );
  }

  // Generate a state parameter to prevent CSRF attacks
  // Include the user ID so we can verify it in the callback
  const state = Buffer.from(
    JSON.stringify({
      userId,
      nonce: randomBytes(16).toString("hex"),
    })
  ).toString("base64url");

  // Build the authorization URL
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.getRedirectUri(),
    response_type: "code",
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(" "),
    access_type: "offline", // Request refresh token
    prompt: "consent", // Force consent screen to get refresh token
    state,
  });

  const authUrl = `${GOOGLE_OAUTH_CONFIG.authorizationEndpoint}?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
