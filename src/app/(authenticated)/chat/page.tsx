import { ChatPanel } from "@/components/chat/chat-panel";
import { getUserSettings } from "@/app/actions/settings";

export default async function ChatPage() {
  const settings = await getUserSettings();

  return (
    <div className="max-w-4xl mx-auto">
      <ChatPanel
        assistantName={settings?.assistant_name || "Chief of Staff"}
      />
    </div>
  );
}
