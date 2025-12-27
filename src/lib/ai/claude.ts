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

export function buildSystemPrompt(assistantName: string, personality?: string | null): string {
  const basePrompt = `You are ${assistantName}, a helpful AI executive assistant. You help the user manage their calendar, emails, and tasks.

Your capabilities include:
- Answering questions and having helpful conversations
- Remembering information the user shares with you
- (Coming soon) Managing calendar events
- (Coming soon) Reading and searching emails
- (Coming soon) Managing Asana tasks

Be concise, professional, and helpful. If you don't know something, say so.`;

  if (personality) {
    return `${basePrompt}\n\nAdditional personality notes: ${personality}`;
  }

  return basePrompt;
}
