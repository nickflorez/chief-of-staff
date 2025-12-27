"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSession, type SessionWithPreview } from "@/app/actions/sessions";

interface SessionListProps {
  sessions: SessionWithPreview[];
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
}

export function SessionList({ sessions: initialSessions }: SessionListProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (sessionId: string) => {
    if (confirmDeleteId !== sessionId) {
      setConfirmDeleteId(sessionId);
      return;
    }

    setDeletingId(sessionId);
    setError(null);

    const result = await deleteSession(sessionId);

    if (result.error) {
      setError(result.error);
      setDeletingId(null);
      setConfirmDeleteId(null);
      return;
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setDeletingId(null);
    setConfirmDeleteId(null);
    router.refresh();
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-500 mb-6">
          Start a new conversation to see your history here.
        </p>
        <Link href="/chat">
          <Button>Start a Conversation</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <Link
                href={`/history/${session.id}`}
                className="flex-1 min-w-0 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {session.title || "Untitled Conversation"}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {session.last_message_preview && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {session.last_message_preview}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {session.message_count} message{session.message_count === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(session.last_message_at || session.updated_at)}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                {confirmDeleteId === session.id ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelDelete}
                      disabled={deletingId === session.id}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                      disabled={deletingId === session.id}
                    >
                      {deletingId === session.id ? "Deleting..." : "Confirm"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(session.id)}
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
