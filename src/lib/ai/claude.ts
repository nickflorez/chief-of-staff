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

export interface ChatCompletionOptions {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  systemPrompt: string;
  maxTokens?: number;
}

export async function createChatCompletion(options: ChatCompletionOptions) {
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

export function buildSystemPrompt(
  assistantName: string,
  personality?: string | null,
  timezone?: string
): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone || "America/Phoenix",
  });

  const basePrompt = `You are ${assistantName}, a helpful AI executive assistant. You help the user manage their calendar, emails, and tasks.

Today is ${currentDate}. The user's timezone is ${timezone || "America/Phoenix"}.

Your capabilities include:
- Answering questions and having helpful conversations
- Remembering information the user shares with you
- (Coming soon) Managing calendar events
- (Coming soon) Reading and searching emails
- (Coming soon) Managing Asana tasks

Be concise, professional, and helpful. If you don't know something, say so.`;

  if (personality) {
    return `${basePrompt}\n\nAdditional personality/communication style notes from the user: ${personality}`;
  }

  return basePrompt;
}
