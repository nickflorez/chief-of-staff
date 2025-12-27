import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ASANA_OAUTH_CONFIG } from "@/lib/integrations/oauth-config";
import { randomBytes } from "crypto";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ASANA_OAUTH_CONFIG.clientId) {
    return NextResponse.json(
      { error: "Asana OAuth not configured" },
      { status: 500 }
    );
  }

  // Generate a state parameter to prevent CSRF attacks
  const state = Buffer.from(
    JSON.stringify({
      userId,
      nonce: randomBytes(16).toString("hex"),
    })
  ).toString("base64url");

  // Build the authorization URL
  const params = new URLSearchParams({
    client_id: ASANA_OAUTH_CONFIG.clientId,
    redirect_uri: ASANA_OAUTH_CONFIG.getRedirectUri(),
    response_type: "code",
    state,
  });

  const authUrl = `${ASANA_OAUTH_CONFIG.authorizationEndpoint}?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
