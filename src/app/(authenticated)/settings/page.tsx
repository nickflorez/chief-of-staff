export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Assistant Configuration</h2>
          <p className="text-gray-500">Configure your assistant settings here...</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          <p className="text-gray-500">Connect your accounts here...</p>
        </div>
      </div>
    </div>
  );
}
