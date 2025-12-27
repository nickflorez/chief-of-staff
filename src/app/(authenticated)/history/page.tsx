import { getSessions } from "@/app/actions/sessions";
import { SessionList } from "@/components/history/session-list";

export default async function HistoryPage() {
  const { sessions, error } = await getSessions();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversation History</h1>
        <p className="text-gray-500 mt-1">View and manage your past conversations</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <SessionList sessions={sessions} />
      )}
    </div>
  );
}
