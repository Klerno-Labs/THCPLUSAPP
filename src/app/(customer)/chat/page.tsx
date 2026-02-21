"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bot,
  Send,
  ArrowLeft,
  Sparkles,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Suggestions ──────────────────────────────────────────
const SUGGESTIONS = [
  "What's good for relaxing after work?",
  "I want something energizing for daytime",
  "What's your strongest flower?",
  "Recommend something for a beginner",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content:
    "Hey! I'm your AI Budtender. Tell me what kind of experience you're looking for — relaxing, energizing, creative, pain relief — and I'll recommend something from our menu. What sounds good?",
};

// ─── Chat Page ────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingContent]);

  const handleSend = useCallback(
    async (text?: string) => {
      const message = text || input.trim();
      if (!message || isTyping) return;

      const userMsg: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        content: message,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);
      setStreamingContent("");

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            sessionId: `web_${Date.now()}`,
            language: "en",
          }),
        });

        if (!res.ok) throw new Error("Chat API error");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.type === "text" && data.content) {
                fullText += data.content;
                setStreamingContent(fullText);
              }

              if (data.type === "done") {
                // Streaming complete
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }

        if (fullText) {
          const aiMsg: Message = {
            id: `ai_${Date.now()}`,
            role: "assistant",
            content: fullText,
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
      } catch {
        // Fallback: show error message
        const errorMsg: Message = {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or visit us in-store and our staff will be happy to help you find the perfect product!",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
        setStreamingContent("");
      }
    },
    [input, isTyping]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#090F09]">
      {/* Header */}
      <div className="border-b border-emerald-900/30 bg-[#111A11]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-emerald-950/50 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100">AI Budtender</h1>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">Online</span>
            </div>
          </div>
          <div className="ml-auto">
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-900/30 bg-[#111A11] text-zinc-300"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Leaf className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                      AI Budtender
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
              </div>
            </motion.div>
          ))}

          {/* Streaming response */}
          {isTyping && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] rounded-2xl border border-emerald-900/30 bg-[#111A11] px-4 py-3 text-sm leading-relaxed text-zinc-300">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Leaf className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    AI Budtender
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{streamingContent.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
              </div>
            </motion.div>
          )}

          {/* Typing indicator (no content yet) */}
          {isTyping && !streamingContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl border border-emerald-900/30 bg-[#111A11] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Leaf className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    AI Budtender
                  </span>
                </div>
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-emerald-500/60"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions (only show when few messages) */}
      {messages.length <= 2 && (
        <div className="border-t border-emerald-900/20 bg-[#111A11]/50">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="rounded-full border border-emerald-900/30 bg-[#111A11] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-emerald-700/50 hover:text-zinc-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-emerald-900/30 bg-[#111A11]/80 backdrop-blur-md">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about strains, effects, or recommendations..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isTyping}
            className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
