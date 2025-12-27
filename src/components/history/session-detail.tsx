"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, User, MessageSquare, Pencil, Check, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { updateSessionTitle, type SessionWithMessages } from "@/app/actions/sessions";
import { cn } from "@/lib/utils";

interface SessionDetailProps {
  session: SessionWithMessages;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function SessionDetail({ session }: SessionDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(session.title || "Untitled Conversation");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTitle = async () => {
    if (!title.trim()) {
      setTitle(session.title || "Untitled Conversation");
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const result = await updateSessionTitle(session.id, title.trim());
    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    }
  };

  const handleCancelEdit = () => {
    setTitle(session.title || "Untitled Conversation");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200">
        <Link href="/history">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm font-semibold"
                autoFocus
                disabled={isSaving}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveTitle}
                disabled={isSaving}
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="h-8 w-8 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 truncate">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}
          <p className="text-sm text-gray-500">
            {session.messages.length} message{session.messages.length === 1 ? "" : "s"} - Started{" "}
            {formatDateTime(session.created_at)}
          </p>
        </div>

        <Link href={`/chat?session=${session.id}`}>
          <Button size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            Continue
          </Button>
        </Link>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        {session.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages</h3>
            <p className="text-gray-500">
              This conversation has no messages yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-blue-100 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="max-w-[80%]">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-2">
                    {formatDateTime(message.created_at)}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-gray-200 flex-shrink-0">
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Read-only view</span>
          <Link href={`/chat?session=${session.id}`} className="text-blue-600 hover:text-blue-700">
            Continue this conversation
          </Link>
        </div>
      </div>
    </div>
  );
}
