import { getValidAccessToken } from "@/lib/integrations/token-refresh";
import type Anthropic from "@anthropic-ai/sdk";

// Gmail API base URL
const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";

// Tool definitions for Claude
export const gmailToolDefinitions: Anthropic.Messages.Tool[] = [
  {
    name: "search_emails",
    description:
      "Search the user's Gmail inbox using a query string. Returns a list of matching emails with subject, sender, date, and snippet. Use standard Gmail search operators like 'from:', 'to:', 'subject:', 'is:unread', 'newer_than:', etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Gmail search query (e.g., 'from:john@example.com', 'is:unread', 'subject:meeting newer_than:7d')",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of emails to return (default: 10, max: 50)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_email",
    description:
      "Get the full details of a specific email by its ID. Returns the complete email including subject, sender, recipients, date, and body content.",
    input_schema: {
      type: "object" as const,
      properties: {
        emailId: {
          type: "string",
          description: "The Gmail message ID",
        },
      },
      required: ["emailId"],
    },
  },
  {
    name: "send_email",
    description:
      "Send an email on behalf of the user. The email will be sent immediately. Use this carefully and confirm with the user before sending.",
    input_schema: {
      type: "object" as const,
      properties: {
        to: {
          type: "string",
          description: "Recipient email address",
        },
        subject: {
          type: "string",
          description: "Email subject line",
        },
        body: {
          type: "string",
          description: "Email body content (plain text)",
        },
        cc: {
          type: "string",
          description: "CC email address (optional)",
        },
        bcc: {
          type: "string",
          description: "BCC email address (optional)",
        },
      },
      required: ["to", "subject", "body"],
    },
  },
];

// Tool execution functions

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
    }>;
  };
  internalDate?: string;
}

interface GmailListResponse {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export async function searchEmails(
  userId: string,
  query: string,
  maxResults: number = 10
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "google");
    if (!accessToken) {
      return {
        success: false,
        error: "Gmail is not connected or the connection has expired. Please reconnect Gmail in settings.",
      };
    }

    const effectiveMaxResults = Math.min(maxResults, 50);

    // Search for messages
    const searchUrl = new URL(`${GMAIL_API_BASE}/users/me/messages`);
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("maxResults", effectiveMaxResults.toString());

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.text();
      console.error("Gmail search error:", errorData);
      return { success: false, error: "Failed to search emails" };
    }

    const searchData: GmailListResponse = await searchResponse.json();
    const messages = searchData.messages || [];

    if (messages.length === 0) {
      return { success: true, data: { emails: [], total: 0 } };
    }

    // Fetch details for each message (batch)
    const emailDetails = await Promise.all(
      messages.map(async (msg) => {
        const msgResponse = await fetch(
          `${GMAIL_API_BASE}/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!msgResponse.ok) return null;

        const msgData: GmailMessage = await msgResponse.json();
        const headers = msgData.payload?.headers || [];

        const getHeader = (name: string) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

        return {
          id: msgData.id,
          threadId: msgData.threadId,
          subject: getHeader("Subject"),
          from: getHeader("From"),
          to: getHeader("To"),
          date: getHeader("Date"),
          snippet: msgData.snippet,
        };
      })
    );

    const validEmails = emailDetails.filter(Boolean);

    return {
      success: true,
      data: {
        emails: validEmails,
        total: validEmails.length,
        query,
      },
    };
  } catch (error) {
    console.error("Error searching emails:", error);
    return { success: false, error: "An error occurred while searching emails" };
  }
}

export async function getEmail(
  userId: string,
  emailId: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "google");
    if (!accessToken) {
      return {
        success: false,
        error: "Gmail is not connected or the connection has expired. Please reconnect Gmail in settings.",
      };
    }

    const response = await fetch(
      `${GMAIL_API_BASE}/users/me/messages/${emailId}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Email not found" };
      }
      return { success: false, error: "Failed to retrieve email" };
    }

    const msgData: GmailMessage = await response.json();
    const headers = msgData.payload?.headers || [];

    const getHeader = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

    // Extract body content
    let body = "";
    if (msgData.payload?.body?.data) {
      body = Buffer.from(msgData.payload.body.data, "base64").toString("utf-8");
    } else if (msgData.payload?.parts) {
      // Look for text/plain or text/html parts
      const textPart = msgData.payload.parts.find((p) => p.mimeType === "text/plain");
      const htmlPart = msgData.payload.parts.find((p) => p.mimeType === "text/html");
      const part = textPart || htmlPart;

      if (part?.body?.data) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8");
        // If HTML, strip tags for a cleaner response
        if (part.mimeType === "text/html") {
          body = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        }
      }
    }

    return {
      success: true,
      data: {
        id: msgData.id,
        threadId: msgData.threadId,
        subject: getHeader("Subject"),
        from: getHeader("From"),
        to: getHeader("To"),
        cc: getHeader("Cc"),
        date: getHeader("Date"),
        body: body.slice(0, 5000), // Limit body size
        snippet: msgData.snippet,
      },
    };
  } catch (error) {
    console.error("Error getting email:", error);
    return { success: false, error: "An error occurred while retrieving the email" };
  }
}

export async function sendEmail(
  userId: string,
  to: string,
  subject: string,
  body: string,
  cc?: string,
  bcc?: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "google");
    if (!accessToken) {
      return {
        success: false,
        error: "Gmail is not connected or the connection has expired. Please reconnect Gmail in settings.",
      };
    }

    // Build the email in RFC 2822 format
    const emailLines = [
      `To: ${to}`,
      ...(cc ? [`Cc: ${cc}`] : []),
      ...(bcc ? [`Bcc: ${bcc}`] : []),
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
    ];

    const email = emailLines.join("\r\n");
    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await fetch(`${GMAIL_API_BASE}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gmail send error:", errorData);
      return { success: false, error: "Failed to send email" };
    }

    const result = await response.json();

    return {
      success: true,
      data: {
        messageId: result.id,
        threadId: result.threadId,
        message: `Email sent successfully to ${to}`,
      },
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "An error occurred while sending the email" };
  }
}

// Tool handler function
export async function handleGmailTool(
  userId: string,
  toolName: string,
  input: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  switch (toolName) {
    case "search_emails":
      return searchEmails(
        userId,
        input.query as string,
        input.maxResults as number | undefined
      );

    case "get_email":
      return getEmail(userId, input.emailId as string);

    case "send_email":
      return sendEmail(
        userId,
        input.to as string,
        input.subject as string,
        input.body as string,
        input.cc as string | undefined,
        input.bcc as string | undefined
      );

    default:
      return { success: false, error: `Unknown Gmail tool: ${toolName}` };
  }
}
