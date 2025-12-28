/**
 * Fireflies.ai AI Tools
 *
 * Tools for Claude to access meeting transcripts from Fireflies.ai
 */

import type Anthropic from "@anthropic-ai/sdk";
import { getFirefliesApiKey } from "@/app/actions/settings";
import {
  listTranscripts,
  getTranscript,
  searchTranscripts,
  FirefliesTranscript,
  FirefliesTranscriptDetail,
} from "@/lib/integrations/fireflies-client";

// Tool names for routing
export const FIREFLIES_TOOL_NAMES = [
  "list_fireflies_transcripts",
  "get_fireflies_transcript",
  "search_fireflies_transcripts",
] as const;

export type FirefliesToolName = (typeof FIREFLIES_TOOL_NAMES)[number];

// Tool definitions for Claude
export const firefliesToolDefinitions: Anthropic.Messages.Tool[] = [
  {
    name: "list_fireflies_transcripts",
    description:
      "List recent meeting transcripts from Fireflies.ai. Returns meeting titles, dates, durations, and participants.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of transcripts to return (1-50, default 10)",
        },
        fromDate: {
          type: "string",
          description: "Only return transcripts from after this date (ISO 8601 format, e.g., 2024-01-01)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_fireflies_transcript",
    description:
      "Get a specific meeting transcript with full details including summary, action items, keywords, and the conversation text.",
    input_schema: {
      type: "object" as const,
      properties: {
        transcriptId: {
          type: "string",
          description: "The ID of the transcript to retrieve",
        },
      },
      required: ["transcriptId"],
    },
  },
  {
    name: "search_fireflies_transcripts",
    description:
      "Search meeting transcripts by keyword. Searches both meeting titles and spoken content.",
    input_schema: {
      type: "object" as const,
      properties: {
        keyword: {
          type: "string",
          description: "The search term to look for in transcripts",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default 10)",
        },
      },
      required: ["keyword"],
    },
  },
];

// Helper to format transcript for display
function formatTranscriptList(transcripts: FirefliesTranscript[]): string {
  if (transcripts.length === 0) {
    return "No transcripts found.";
  }

  return transcripts
    .map((t, i) => {
      const date = new Date(t.date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const duration = Math.round(t.duration / 60);
      const participants = t.participants?.join(", ") || "Unknown";

      return `${i + 1}. **${t.title}**
   - ID: ${t.id}
   - Date: ${date}
   - Duration: ${duration} minutes
   - Participants: ${participants}`;
    })
    .join("\n\n");
}

// Helper to format full transcript details
function formatTranscriptDetail(transcript: FirefliesTranscriptDetail): string {
  const date = new Date(transcript.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const duration = Math.round(transcript.duration / 60);

  let result = `# ${transcript.title}

**Date:** ${date}
**Duration:** ${duration} minutes
**Participants:** ${transcript.participants?.join(", ") || "Unknown"}
**Host:** ${transcript.host_email || "Unknown"}
`;

  if (transcript.overview) {
    result += `
## Summary
${transcript.overview}
`;
  }

  if (transcript.action_items && transcript.action_items.length > 0) {
    result += `
## Action Items
${transcript.action_items.map((item) => `- ${item}`).join("\n")}
`;
  }

  if (transcript.keywords && transcript.keywords.length > 0) {
    result += `
## Keywords
${transcript.keywords.join(", ")}
`;
  }

  // Include first part of transcript (limit to avoid token explosion)
  if (transcript.sentences && transcript.sentences.length > 0) {
    const firstSentences = transcript.sentences.slice(0, 20);
    result += `
## Transcript Preview (first ${firstSentences.length} statements)
${firstSentences
  .map((s) => `**${s.speaker_name}:** ${s.text}`)
  .join("\n")}
`;

    if (transcript.sentences.length > 20) {
      result += `\n*... and ${transcript.sentences.length - 20} more statements. Use transcript_url to access the full transcript.*`;
    }
  }

  result += `
---
**Transcript URL:** ${transcript.transcript_url || "Not available"}
**Audio URL:** ${transcript.audio_url || "Not available"}`;

  return result;
}

// Tool handlers
async function handleListTranscripts(
  userId: string,
  input: { limit?: number; fromDate?: string }
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const apiKey = await getFirefliesApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: "Fireflies.ai is not connected. Please add your API key in Settings.",
      };
    }

    const transcripts = await listTranscripts(apiKey, {
      limit: input.limit || 10,
      fromDate: input.fromDate,
    });

    return {
      success: true,
      data: formatTranscriptList(transcripts),
    };
  } catch (error) {
    console.error("Error listing Fireflies transcripts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list transcripts",
    };
  }
}

async function handleGetTranscript(
  userId: string,
  input: { transcriptId: string }
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const apiKey = await getFirefliesApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: "Fireflies.ai is not connected. Please add your API key in Settings.",
      };
    }

    const transcript = await getTranscript(apiKey, input.transcriptId);
    if (!transcript) {
      return {
        success: false,
        error: `Transcript with ID "${input.transcriptId}" not found.`,
      };
    }

    return {
      success: true,
      data: formatTranscriptDetail(transcript),
    };
  } catch (error) {
    console.error("Error getting Fireflies transcript:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get transcript",
    };
  }
}

async function handleSearchTranscripts(
  userId: string,
  input: { keyword: string; limit?: number }
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const apiKey = await getFirefliesApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: "Fireflies.ai is not connected. Please add your API key in Settings.",
      };
    }

    const transcripts = await searchTranscripts(apiKey, input.keyword, {
      limit: input.limit || 10,
    });

    if (transcripts.length === 0) {
      return {
        success: true,
        data: `No transcripts found matching "${input.keyword}".`,
      };
    }

    return {
      success: true,
      data: `Found ${transcripts.length} transcript(s) matching "${input.keyword}":\n\n${formatTranscriptList(transcripts)}`,
    };
  } catch (error) {
    console.error("Error searching Fireflies transcripts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search transcripts",
    };
  }
}

// Main handler dispatcher
export async function handleFirefliesTool(
  userId: string,
  toolName: string,
  input: Record<string, unknown>
): Promise<{ success: boolean; data?: string; error?: string }> {
  switch (toolName) {
    case "list_fireflies_transcripts":
      return handleListTranscripts(userId, input as { limit?: number; fromDate?: string });

    case "get_fireflies_transcript":
      return handleGetTranscript(userId, input as { transcriptId: string });

    case "search_fireflies_transcripts":
      return handleSearchTranscripts(userId, input as { keyword: string; limit?: number });

    default:
      return {
        success: false,
        error: `Unknown Fireflies tool: ${toolName}`,
      };
  }
}
