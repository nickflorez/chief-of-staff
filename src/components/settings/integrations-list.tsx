"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, Link2, Calendar, ListTodo, Mic, ExternalLink, Eye, EyeOff } from "lucide-react";
import { disconnectIntegration, IntegrationStatus } from "@/app/actions/integrations";
import { saveFirefliesApiKey, removeFirefliesApiKey } from "@/app/actions/settings";

interface IntegrationsListProps {
  integrations: IntegrationStatus[];
  oauthAvailability: {
    google: boolean;
    asana: boolean;
  };
  firefliesConnected: boolean;
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
  firefliesConnected,
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
      <FirefliesCard isConnected={firefliesConnected} />
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

function FirefliesCard({ isConnected }: { isConnected: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [connected, setConnected] = useState(isConnected);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }

    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await saveFirefliesApiKey(apiKey.trim());
      if (result.success) {
        setSuccess(true);
        setConnected(true);
        setApiKey("");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save API key");
      }
    });
  };

  const handleDisconnect = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeFirefliesApiKey();
      if (result.success) {
        setConnected(false);
      } else {
        setError(result.error || "Failed to disconnect");
      }
    });
  };

  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Mic className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">Fireflies.ai</h3>
          <p className="text-sm text-gray-500">Access AI-powered meeting transcripts</p>

          {connected ? (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder="Enter your Fireflies API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 text-sm"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending || !apiKey.trim()}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              <a
                href="https://app.fireflies.ai/integrations/custom/fireflies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Get your API key from Fireflies
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-600 mt-1">API key saved successfully!</p>
          )}
        </div>
      </div>

      {connected && (
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
      )}
    </div>
  );
}
