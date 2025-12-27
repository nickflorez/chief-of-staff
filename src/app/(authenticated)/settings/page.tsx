import { getUserSettings } from "@/app/actions/settings";
import { AssistantSettingsForm } from "@/components/settings/assistant-settings-form";

export default async function SettingsPage() {
  const settings = await getUserSettings();

  const initialSettings = {
    assistantName: settings?.assistant_name || "Chief of Staff",
    assistantPersonality: settings?.assistant_personality || null,
    timezone: settings?.timezone || "America/Phoenix",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="space-y-6">
        {/* Assistant Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Assistant Configuration</h2>
          <AssistantSettingsForm initialSettings={initialSettings} />
        </div>

        {/* Integrations - Coming Soon */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          <p className="text-gray-500 mb-4">
            Connect your accounts to unlock more capabilities.
          </p>
          <div className="space-y-4">
            <IntegrationCard
              name="Google Calendar"
              description="View and manage your calendar events"
              status="coming_soon"
            />
            <IntegrationCard
              name="Gmail"
              description="Read and search your emails"
              status="coming_soon"
            />
            <IntegrationCard
              name="Asana"
              description="Manage your tasks and projects"
              status="coming_soon"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({
  name,
  description,
  status,
}: {
  name: string;
  description: string;
  status: "connected" | "disconnected" | "coming_soon";
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div>
        {status === "coming_soon" && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            Coming Soon
          </span>
        )}
        {status === "connected" && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Connected
          </span>
        )}
        {status === "disconnected" && (
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
