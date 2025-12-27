"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Check } from "lucide-react";
import { saveUserSettings } from "@/app/actions/settings";
import type { SettingsFormData } from "@/app/actions/settings";
import { TIMEZONES } from "@/lib/constants/timezones";

interface AssistantSettingsFormProps {
  initialSettings: {
    assistantName: string;
    assistantPersonality: string | null;
    timezone: string;
  };
}

export function AssistantSettingsForm({ initialSettings }: AssistantSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assistantName, setAssistantName] = useState(initialSettings.assistantName);
  const [assistantPersonality, setAssistantPersonality] = useState(
    initialSettings.assistantPersonality || ""
  );
  const [timezone, setTimezone] = useState(initialSettings.timezone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const formData: SettingsFormData = {
        assistantName: assistantName.trim() || "Chief of Staff",
        assistantPersonality: assistantPersonality.trim() || null,
        timezone,
      };

      const result = await saveUserSettings(formData);

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || "Failed to save settings");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Assistant Name */}
      <div className="space-y-2">
        <Label htmlFor="assistantName">Assistant Name</Label>
        <Input
          id="assistantName"
          value={assistantName}
          onChange={(e) => setAssistantName(e.target.value)}
          placeholder="Chief of Staff"
          className="max-w-md"
        />
        <p className="text-sm text-gray-500">
          Give your assistant a custom name. This will be shown in the chat interface.
        </p>
      </div>

      {/* Personality */}
      <div className="space-y-2">
        <Label htmlFor="assistantPersonality">Personality & Tone</Label>
        <Textarea
          id="assistantPersonality"
          value={assistantPersonality}
          onChange={(e) => setAssistantPersonality(e.target.value)}
          placeholder="e.g., Be concise and direct. Use a friendly but professional tone. Focus on actionable advice."
          className="max-w-xl min-h-[100px]"
        />
        <p className="text-sm text-gray-500">
          Customize how your assistant communicates. Describe the tone, style, or specific behaviors you prefer.
        </p>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Used for calendar events and time-related tasks.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        {saved && (
          <span className="text-sm text-green-600">Settings saved successfully</span>
        )}
      </div>
    </form>
  );
}
