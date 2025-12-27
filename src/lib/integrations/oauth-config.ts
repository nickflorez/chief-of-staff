// OAuth configuration for external integrations

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  userInfoEndpoint: "https://www.googleapis.com/oauth2/v2/userinfo",
  scopes: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
  getRedirectUri: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/api/oauth/google/callback`;
  },
};

export const ASANA_OAUTH_CONFIG = {
  clientId: process.env.ASANA_CLIENT_ID || "",
  clientSecret: process.env.ASANA_CLIENT_SECRET || "",
  authorizationEndpoint: "https://app.asana.com/-/oauth_authorize",
  tokenEndpoint: "https://app.asana.com/-/oauth_token",
  userInfoEndpoint: "https://app.asana.com/api/1.0/users/me",
  scopes: ["default"],
  getRedirectUri: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/api/oauth/asana/callback`;
  },
};

export type OAuthProvider = "google" | "asana";

export function getOAuthConfig(provider: OAuthProvider) {
  switch (provider) {
    case "google":
      return GOOGLE_OAUTH_CONFIG;
    case "asana":
      return ASANA_OAUTH_CONFIG;
    default:
      throw new Error(`Unknown OAuth provider: ${provider}`);
  }
}
