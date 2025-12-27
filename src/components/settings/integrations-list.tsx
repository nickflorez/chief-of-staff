"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Link2, Calendar, Mail, ListTodo } from "lucide-react";
import { disconnectIntegration, IntegrationStatus } from "@/app/actions/integrations";

interface IntegrationsListProps {
  integrations: IntegrationStatus[];
  oauthAvailability: {
    google: boolean;
    asana: boolean;
  };
}

const INTEGRATION_CONFIG = {
  google: {
    name: "Google",
    description: "Connect to Google Calendar and Gmail",
    icon: Calendar,
    services: ["Calendar", "Gmail"],
  },
  asana: {
    name: "Asana",
    description: "Manage your tasks and projects",
    icon: ListTodo,
    services: ["Tasks"],
  },
} as const;

export function IntegrationsList({
  integrations,
  oauthAvailability,
}: IntegrationsListProps) {
  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.provider}
          integration={integration}
          isAvailable={oauthAvailability[integration.provider]}
        />
      ))}
    </div>
  );
}

function IntegrationCard({
  integration,
  isAvailable,
}: {
  integration: IntegrationStatus;
  isAvailable: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const config = INTEGRATION_CONFIG[integration.provider];
  const Icon = config.icon;

  const handleConnect = () => {
    // Redirect to OAuth flow
    window.location.href = `/api/oauth/${integration.provider}`;
  };

  const handleDisconnect = () => {
    setError(null);
    startTransition(async () => {
      const result = await disconnectIntegration(integration.provider);
      if (!result.success) {
        setError(result.error || "Failed to disconnect");
      }
    });
  };

  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{config.name}</h3>
          <p className="text-sm text-gray-500">{config.description}</p>
          {integration.connected && integration.connectedEmail && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected as {integration.connectedEmail}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>
      <div>
        {!isAvailable ? (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
            Not Configured
          </span>
        ) : integration.connected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Disconnecting...
              </>
            ) : (
              "Disconnect"
            )}
          </Button>
        ) : (
          <Button size="sm" onClick={handleConnect}>
            <Link2 className="mr-1 h-3 w-3" />
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
