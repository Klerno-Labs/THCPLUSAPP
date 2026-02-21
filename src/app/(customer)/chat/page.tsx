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
  Loader2,
  ShoppingCart,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useCartContext } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";

// ─── Suggestions ──────────────────────────────────────────
const SUGGESTIONS = [
  "What's good for relaxing after work?",
  "I want something energizing for daytime",
  "What's your strongest flower?",
  "Recommend something for a beginner",
  "What concentrates do you have?",
  "Best pre-rolls under $15?",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  addedProducts?: Array<{ name: string; quantity: number }>;
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content:
    "Hey! I'm your AI Budtender. Tell me what kind of experience you're looking for — relaxing, energizing, creative, pain relief — and I'll recommend something from our menu. I can even add products to your cart for you!",
};

// ─── Chat Page ────────────────────────────────────────────
export default function ChatPage() {
  const { data: session } = useSession();
  const { addItem } = useCartContext();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sessionId] = useState(
    () => `web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingContent]);

  // Focus input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Handle addToCart function calls from the AI
  const handleFunctionCall = useCallback(
    async (args: { productId: string; quantity?: number }) => {
      try {
        const res = await fetch(`/api/products/${args.productId}`);
        if (!res.ok) return null;
        const product = await res.json();

        addItem(product, args.quantity || 1);

        toast({
          title: "Added to cart",
          description: `${product.name} x${args.quantity || 1}`,
        });

        return { name: product.name, quantity: args.quantity || 1 };
      } catch {
        return null;
      }
    },
    [addItem, toast]
  );

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
        const customerId =
          (session?.user as { id?: string; role?: string })?.role === "CUSTOMER"
            ? (session?.user as { id: string }).id
            : undefined;

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            customerId,
            sessionId: customerId ? undefined : sessionId,
            language: localStorage.getItem("thcplus-lang") || "en",
          }),
        });

        if (!res.ok) throw new Error("Chat API error");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let fullText = "";
        const addedProducts: Array<{ name: string; quantity: number }> = [];

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

              if (data.type === "function_call" && data.name === "addToCart") {
                const result = await handleFunctionCall(data.arguments);
                if (result) addedProducts.push(result);
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }

        if (fullText || addedProducts.length > 0) {
          const aiMsg: Message = {
            id: `ai_${Date.now()}`,
            role: "assistant",
            content: fullText || "Done!",
            addedProducts: addedProducts.length > 0 ? addedProducts : undefined,
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
      } catch {
        const errorMsg: Message = {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or visit us in-store and our staff will be happy to help you!",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
        setStreamingContent("");
      }
    },
    [input, isTyping, session, sessionId, handleFunctionCall]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-[#090F09] sm:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-emerald-900/30 bg-[#111A11]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-emerald-950/50 hover:text-zinc-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-zinc-100">AI Budtender</h1>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">Powered by GPT-4o</span>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-4 sm:py-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%]",
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-900/30 bg-[#111A11] text-zinc-300"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Leaf className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                      AI Budtender
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">
                  {msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}
                </p>
                {/* Show added products */}
                {msg.addedProducts && msg.addedProducts.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {msg.addedProducts.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg bg-emerald-900/20 px-3 py-2 text-xs text-emerald-400"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>
                          {p.name} x{p.quantity} added to cart
                        </span>
                        <Check className="ml-auto h-3.5 w-3.5" />
                      </div>
                    ))}
                  </div>
                )}
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
              <div className="max-w-[88%] rounded-2xl border border-emerald-900/30 bg-[#111A11] px-4 py-3 text-sm leading-relaxed text-zinc-300 sm:max-w-[80%]">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Leaf className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    AI Budtender
                  </span>
                </div>
                <p className="whitespace-pre-wrap">
                  {streamingContent.replace(/\*\*(.*?)\*\*/g, "$1")}
                </p>
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
      {messages.length <= 2 && !isTyping && (
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
                  className="rounded-full border border-emerald-900/30 bg-[#111A11] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-emerald-700/50 hover:text-zinc-200 active:bg-emerald-900/20"
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
          className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about strains, effects, or recommendations..."
            disabled={isTyping}
            className={cn(
              "flex-1 rounded-xl bg-[#090F09] px-4 py-2.5 text-sm",
              "text-zinc-100 placeholder:text-zinc-600",
              "border border-emerald-900/30",
              "focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30",
              "disabled:opacity-50",
              "transition-all"
            )}
            aria-label="Chat message"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isTyping}
            className="h-10 w-10 shrink-0 bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
            aria-label="Send message"
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="pb-1 text-center text-[9px] text-zinc-600">
          AI assistant — not medical advice
        </p>
      </div>
    </div>
  );
}
