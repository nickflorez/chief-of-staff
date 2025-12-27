import { Suspense } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { getUserSettings } from "@/app/actions/settings";
import { getSession } from "@/app/actions/sessions";

interface ChatPageProps {
  searchParams: Promise<{
    session?: string;
  }>;
}

async function ChatContent({ sessionId }: { sessionId?: string }) {
  const settings = await getUserSettings();

  // If a session ID is provided, load the session messages
  let initialMessages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  }> = [];

  if (sessionId) {
    const { session } = await getSession(sessionId);
    if (session) {
      initialMessages = session.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        created_at: m.created_at,
      }));
    }
  }

  return (
    <ChatPanel
      assistantName={settings?.assistant_name || "Chief of Staff"}
      initialSessionId={sessionId}
      initialMessages={initialMessages}
    />
  );
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;
  const sessionId = params.session;

  return (
    <div className="max-w-4xl mx-auto">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Loading...</p>
          </div>
        }
      >
        <ChatContent sessionId={sessionId} />
      </Suspense>
    </div>
  );
}
