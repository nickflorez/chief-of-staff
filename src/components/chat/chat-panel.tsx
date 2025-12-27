"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, Loader2, Bot, User, RotateCcw, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AttachedImage {
  id: string;
  dataUrl: string;
  mimeType: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: AttachedImage[];
  timestamp: Date;
}

interface InitialMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatPanelProps {
  assistantName?: string;
  initialSessionId?: string;
  initialMessages?: InitialMessage[];
}

export function ChatPanel({
  assistantName = "Chief of Staff",
  initialSessionId,
  initialMessages = [],
}: ChatPanelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionFromUrl = searchParams.get("session");

  const [sessionId, setSessionId] = useState<string | null>(
    initialSessionId || sessionFromUrl || null
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.created_at),
    }))
  );
  const [input, setInput] = useState("");
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 150;
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = newHeight + "px";
    }
  }, [input]);

  // Handle paste events for images
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            const newImage: AttachedImage = {
              id: crypto.randomUUID(),
              dataUrl,
              mimeType: file.type,
            };
            setAttachedImages((prev) => [...prev, newImage]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  const handleSend = async () => {
    if ((!input.trim() && attachedImages.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      images: attachedImages.length > 0 ? [...attachedImages] : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedImages([]);
    setIsLoading(true);
    setError(null);

    // Prepare images for API
    const imagesForApi = userMessage.images?.map((img) => ({
      data: img.dataUrl.split(",")[1], // Remove data:image/...;base64, prefix
      mediaType: img.mimeType,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          images: imagesForApi,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      const data = await response.json();

      // Update sessionId if a new session was created
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        // Update URL without full navigation
        router.replace(`/chat?session=${data.sessionId}`, { scroll: false });
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    router.replace("/chat", { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-blue-100">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">{assistantName}</h2>
            <p className="text-sm text-gray-500">Your AI Executive Assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start a Conversation
            </h3>
            <p className="text-gray-500 max-w-sm">
              Ask me anything! I can help you manage your calendar, emails, and tasks.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-400">
              <p>Try asking:</p>
              <p className="text-blue-600">&quot;What&apos;s on my schedule today?&quot;</p>
              <p className="text-blue-600">&quot;Create a task to review the proposal&quot;</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
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
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  {message.images && message.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {message.images.map((img) => (
                        <div key={img.id} className="relative">
                          <Image
                            src={img.dataUrl}
                            alt="Attached image"
                            width={200}
                            height={200}
                            className="rounded-lg max-w-[200px] max-h-[200px] object-contain"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {message.content && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}
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
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-blue-100 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        {/* Image previews */}
        {attachedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachedImages.map((img) => (
              <div key={img.id} className="relative group">
                <Image
                  src={img.dataUrl}
                  alt="Attached screenshot"
                  width={80}
                  height={80}
                  className="rounded-lg object-cover w-20 h-20 border border-gray-200"
                  unoptimized
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={attachedImages.length > 0 ? "Add a message or press Enter to send..." : "Type a message or paste a screenshot... (Enter to send)"}
              disabled={isLoading}
              rows={1}
              className="min-h-[44px] max-h-[150px] resize-none pr-10"
            />
            {attachedImages.length === 0 && (
              <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && attachedImages.length === 0) || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
