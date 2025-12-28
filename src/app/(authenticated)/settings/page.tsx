import { getUserSettings, hasFirefliesConnection } from "@/app/actions/settings";
import { getUserIntegrations, getOAuthAvailability } from "@/app/actions/integrations";
import { AssistantSettingsForm } from "@/components/settings/assistant-settings-form";
import { IntegrationsList } from "@/components/settings/integrations-list";

export default async function SettingsPage() {
  const [settings, integrations, oauthAvailability, firefliesConnected] = await Promise.all([
    getUserSettings(),
    getUserIntegrations(),
    getOAuthAvailability(),
    hasFirefliesConnection(),
  ]);

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

        {/* Integrations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          <p className="text-gray-500 mb-4">
            Connect your accounts to unlock more capabilities.
          </p>
          <IntegrationsList
            integrations={integrations}
            oauthAvailability={oauthAvailability}
            firefliesConnected={firefliesConnected}
          />
        </div>
      </div>
    </div>
  );
}
