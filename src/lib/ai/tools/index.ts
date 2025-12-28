import type Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/db/supabase";

// Import tool definitions and handlers
import { gmailToolDefinitions, handleGmailTool } from "./gmail-tools";
import { calendarToolDefinitions, handleCalendarTool } from "./calendar-tools";
import { asanaToolDefinitions, handleAsanaTool } from "./asana-tools";
import {
  firefliesToolDefinitions,
  handleFirefliesTool,
  FIREFLIES_TOOL_NAMES,
} from "./fireflies-tools";
import { hasFirefliesConnection } from "@/app/actions/settings";

// Re-export all tools
export { gmailToolDefinitions, handleGmailTool } from "./gmail-tools";
export { calendarToolDefinitions, handleCalendarTool } from "./calendar-tools";
export { asanaToolDefinitions, handleAsanaTool } from "./asana-tools";
export { firefliesToolDefinitions, handleFirefliesTool } from "./fireflies-tools";

// Types
export interface UserIntegrationStatus {
  google: boolean;
  asana: boolean;
  fireflies: boolean;
  googleScopes: string[];
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Tool name prefixes for routing
const GMAIL_TOOLS = ["search_emails", "get_email", "send_email"];
const CALENDAR_TOOLS = [
  "list_calendar_events",
  "get_calendar_event",
  "create_calendar_event",
  "update_calendar_event",
];
const ASANA_TOOLS = [
  "list_asana_tasks",
  "get_asana_task",
  "create_asana_task",
  "complete_asana_task",
];

/**
 * Check which integrations a user has connected
 */
export async function getUserIntegrationStatus(
  userId: string
): Promise<UserIntegrationStatus> {
  const supabase = createServerSupabaseClient();

  // Check OAuth integrations
  const { data: integrations } = await supabase
    .from("user_integrations")
    .select("provider, scopes")
    .eq("clerk_user_id", userId);

  const googleIntegration = integrations?.find((i) => i.provider === "google");
  const asanaIntegration = integrations?.find((i) => i.provider === "asana");

  // Check Fireflies API key connection
  const hasFireflies = await hasFirefliesConnection();

  return {
    google: !!googleIntegration,
    asana: !!asanaIntegration,
    fireflies: hasFireflies,
    googleScopes: googleIntegration?.scopes || [],
  };
}

/**
 * Get available tools based on user's connected integrations
 */
export async function getAvailableTools(
  userId: string
): Promise<Anthropic.Messages.Tool[]> {
  const status = await getUserIntegrationStatus(userId);
  const tools: Anthropic.Messages.Tool[] = [];

  if (status.google) {
    // Check if Gmail scope is available
    const hasGmailScope = status.googleScopes.some(
      (scope) =>
        scope.includes("gmail.readonly") ||
        scope.includes("gmail.modify") ||
        scope.includes("gmail.send") ||
        scope.includes("mail.google.com")
    );

    // Check if Calendar scope is available
    const hasCalendarScope = status.googleScopes.some(
      (scope) =>
        scope.includes("calendar.readonly") ||
        scope.includes("calendar.events") ||
        scope.includes("calendar")
    );

    if (hasGmailScope) {
      tools.push(...gmailToolDefinitions);
    }

    if (hasCalendarScope) {
      tools.push(...calendarToolDefinitions);
    }
  }

  if (status.asana) {
    tools.push(...asanaToolDefinitions);
  }

  if (status.fireflies) {
    tools.push(...firefliesToolDefinitions);
  }

  return tools;
}

/**
 * Handle a tool call from Claude
 */
export async function handleToolCall(
  userId: string,
  toolName: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  // Route to appropriate handler based on tool name
  if (GMAIL_TOOLS.includes(toolName)) {
    return handleGmailTool(userId, toolName, input);
  }

  if (CALENDAR_TOOLS.includes(toolName)) {
    return handleCalendarTool(userId, toolName, input);
  }

  if (ASANA_TOOLS.includes(toolName)) {
    return handleAsanaTool(userId, toolName, input);
  }

  if (FIREFLIES_TOOL_NAMES.includes(toolName as typeof FIREFLIES_TOOL_NAMES[number])) {
    return handleFirefliesTool(userId, toolName, input);
  }

  return {
    success: false,
    error: `Unknown tool: ${toolName}`,
  };
}

/**
 * Format tool result for Claude
 */
export function formatToolResultForClaude(result: ToolResult): string {
  if (result.success) {
    return JSON.stringify(result.data, null, 2);
  }
  return `Error: ${result.error}`;
}

/**
 * Get a summary of available integrations for the system prompt
 */
export async function getIntegrationsSummary(userId: string): Promise<string> {
  const status = await getUserIntegrationStatus(userId);
  const capabilities: string[] = [];

  if (status.google) {
    const hasGmail = status.googleScopes.some(
      (s) => s.includes("gmail") || s.includes("mail")
    );
    const hasCalendar = status.googleScopes.some((s) => s.includes("calendar"));

    if (hasGmail) {
      capabilities.push("- Search and read Gmail emails");
      capabilities.push("- Send emails on your behalf (with confirmation)");
    }
    if (hasCalendar) {
      capabilities.push("- View and manage Google Calendar events");
      capabilities.push("- Create and update calendar events");
    }
  }

  if (status.asana) {
    capabilities.push("- View and manage Asana tasks");
    capabilities.push("- Create new tasks and mark tasks complete");
  }

  if (status.fireflies) {
    capabilities.push("- Access Fireflies.ai meeting transcripts");
    capabilities.push("- Search and retrieve meeting summaries, action items, and keywords");
  }

  if (capabilities.length === 0) {
    return "No integrations are currently connected. Ask the user to connect their accounts in Settings.";
  }

  return `Connected integrations allow me to:\n${capabilities.join("\n")}`;
}
