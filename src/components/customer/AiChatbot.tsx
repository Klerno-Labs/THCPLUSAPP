"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Leaf,
  Loader2,
  ShoppingCart,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useCartContext } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  addedProducts?: Array<{ name: string; quantity: number }>;
}

const SUGGESTIONS = [
  "What's good for relaxing?",
  "Something energizing",
  "Strongest flower?",
  "I'm a beginner",
];

export function AiChatbot() {
  const { data: session } = useSession();
  const { addItem } = useCartContext();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content:
        "Hey! I'm your AI Budtender. Tell me what kind of experience you're looking for and I'll find the perfect product from our menu.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isTyping]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to let animation finish
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Handle addToCart function calls from the AI
  const handleFunctionCall = useCallback(
    async (args: { productId: string; quantity?: number }) => {
      try {
        const res = await fetch(`/api/products/${args.productId}`);
        if (!res.ok) return;
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

  const sendMessage = useCallback(
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
              // Skip unparseable
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
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: "assistant",
            content:
              "I'm having trouble connecting right now. Please try again or ask our staff in-store!",
          },
        ]);
      } finally {
        setIsTyping(false);
        setStreamingContent("");
      }
    },
    [input, isTyping, session, sessionId, handleFunctionCall]
  );

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed z-50",
              "bottom-[5.5rem] right-4 sm:bottom-6 sm:right-6",
              "h-14 w-14 rounded-full",
              "bg-gradient-to-br from-emerald-500 to-emerald-600",
              "text-white shadow-lg shadow-emerald-900/30",
              "flex items-center justify-center",
              "transition-transform duration-200 hover:scale-105 active:scale-95"
            )}
            aria-label="Open AI Budtender chat"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden",
              // Mobile: full screen with safe area
              "inset-0 sm:inset-auto",
              // Desktop: floating panel in corner
              "sm:bottom-6 sm:right-6",
              "sm:h-[min(580px,80vh)] sm:w-[380px]",
              "sm:rounded-2xl",
              "bg-[#090F09] sm:border sm:border-emerald-900/30",
              "sm:shadow-2xl sm:shadow-black/40"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-900/30 bg-[#111A11] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-100">
                    AI Budtender
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-zinc-500">
                      Powered by GPT-4o
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="space-y-3 px-4 py-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                        msg.role === "user"
                          ? "bg-emerald-600 text-white"
                          : "border border-emerald-900/30 bg-[#111A11] text-zinc-300"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="mb-1 flex items-center gap-1.5">
                          <Leaf className="h-3 w-3 text-emerald-400" />
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                            AI Budtender
                          </span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">
                        {msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}
                      </p>
                      {/* Show added products */}
                      {msg.addedProducts && msg.addedProducts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.addedProducts.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-900/20 px-2.5 py-1.5 text-[11px] text-emerald-400"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              <span>
                                {p.name} x{p.quantity}
                              </span>
                              <Check className="ml-auto h-3 w-3" />
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-2xl border border-emerald-900/30 bg-[#111A11] px-3.5 py-2.5 text-[13px] leading-relaxed text-zinc-300">
                      <div className="mb-1 flex items-center gap-1.5">
                        <Leaf className="h-3 w-3 text-emerald-400" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                          AI Budtender
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">
                        {streamingContent.replace(/\*\*(.*?)\*\*/g, "$1")}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Typing indicator */}
                {isTyping && !streamingContent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="rounded-2xl border border-emerald-900/30 bg-[#111A11] px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Leaf className="h-3 w-3 text-emerald-400" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                          AI Budtender
                        </span>
                      </div>
                      <div className="mt-1.5 flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-emerald-500/60"
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

            {/* Suggestions — only show early in convo */}
            {messages.length <= 2 && !isTyping && (
              <div className="border-t border-emerald-900/20 px-4 py-2.5">
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-full border border-emerald-900/30 bg-[#111A11] px-3 py-1.5 text-[11px] text-zinc-400 transition-colors hover:border-emerald-700/50 hover:text-zinc-200 active:bg-emerald-900/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="px-4 py-1">
              <p className="text-center text-[9px] text-zinc-600">
                AI assistant — not medical advice
              </p>
            </div>

            {/* Input */}
            <div className="border-t border-emerald-900/30 bg-[#111A11] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about strains, effects..."
                  disabled={isTyping}
                  className={cn(
                    "flex-1 rounded-xl bg-[#090F09] px-3.5 py-2.5 text-sm",
                    "text-zinc-100 placeholder:text-zinc-600",
                    "border border-emerald-900/30",
                    "focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30",
                    "disabled:opacity-50",
                    "transition-all"
                  )}
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    "bg-emerald-600 text-white",
                    "transition-all hover:bg-emerald-500",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "active:scale-95"
                  )}
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
