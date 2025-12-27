import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY environment variable");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

// Message types that support tool use
export type MessageContent = Anthropic.Messages.ContentBlock;
export type ToolUseBlock = Anthropic.Messages.ToolUseBlock;
export type TextBlock = Anthropic.Messages.TextBlock;

export interface ChatCompletionOptions {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  systemPrompt: string;
  maxTokens?: number;
}

export interface ChatCompletionWithToolsOptions {
  messages: Anthropic.Messages.MessageParam[];
  systemPrompt: string;
  tools?: Anthropic.Messages.Tool[];
  maxTokens?: number;
}

export interface ChatCompletionResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ChatCompletionWithToolsResponse {
  content: MessageContent[];
  stopReason: Anthropic.Messages.Message["stop_reason"];
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export async function createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: options.maxTokens || 4096,
    system: options.systemPrompt,
    messages: options.messages,
  });

  // Extract text content
  const textContent = response.content.find((c) => c.type === "text");
  const text = textContent?.type === "text" ? textContent.text : "";

  return {
    content: text,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

/**
 * Create a chat completion with tool support
 * Returns the raw response to allow tool use handling
 */
export async function createChatCompletionWithTools(
  options: ChatCompletionWithToolsOptions
): Promise<ChatCompletionWithToolsResponse> {
  const anthropic = getAnthropicClient();

  const requestParams: Anthropic.Messages.MessageCreateParams = {
    model: "claude-sonnet-4-20250514",
    max_tokens: options.maxTokens || 4096,
    system: options.systemPrompt,
    messages: options.messages,
  };

  // Only include tools if provided
  if (options.tools && options.tools.length > 0) {
    requestParams.tools = options.tools;
  }

  const response = await anthropic.messages.create(requestParams);

  return {
    content: response.content,
    stopReason: response.stop_reason,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

/**
 * Extract text content from a message response
 */
export function extractTextFromContent(content: MessageContent[]): string {
  const textBlocks = content.filter((block): block is TextBlock => block.type === "text");
  return textBlocks.map((block) => block.text).join("\n");
}

/**
 * Check if response contains tool use
 */
export function hasToolUse(content: MessageContent[]): boolean {
  return content.some((block) => block.type === "tool_use");
}

/**
 * Extract tool use blocks from response
 */
export function extractToolUseBlocks(content: MessageContent[]): ToolUseBlock[] {
  return content.filter((block): block is ToolUseBlock => block.type === "tool_use");
}

export function buildSystemPrompt(
  assistantName: string,
  personality?: string | null,
  timezone?: string,
  integrationCapabilities?: string
): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone || "America/Phoenix",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || "America/Phoenix",
  });

  let capabilitiesSection: string;
  if (integrationCapabilities) {
    capabilitiesSection = `Your capabilities include:
- Answering questions and having helpful conversations
- Remembering information the user shares with you

${integrationCapabilities}

When using tools:
- Always confirm before sending emails or making significant changes
- Provide clear summaries of what you found or did
- If a tool fails, explain the issue and suggest next steps`;
  } else {
    capabilitiesSection = `Your capabilities include:
- Answering questions and having helpful conversations
- Remembering information the user shares with you

No integrations are currently connected. The user can connect Gmail, Google Calendar, and Asana in Settings to unlock additional capabilities.`;
  }

  const basePrompt = `You are ${assistantName}, a helpful AI executive assistant. You help the user manage their calendar, emails, and tasks.

Today is ${currentDate}. The current time is ${currentTime}. The user's timezone is ${timezone || "America/Phoenix"}.

${capabilitiesSection}

Be concise, professional, and helpful. If you don't know something, say so.`;

  if (personality) {
    return `${basePrompt}\n\nAdditional personality/communication style notes from the user: ${personality}`;
  }

  return basePrompt;
}
