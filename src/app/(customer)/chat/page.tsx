"use client";

import React, { useState, useRef, useEffect } from "react";
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

// ─── Mock AI Responses ────────────────────────────────────
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

// Simple keyword-based mock responses
function getAiResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("relax") || lower.includes("chill") || lower.includes("sleep") || lower.includes("wind down")) {
    return "For relaxation, I'd recommend **Motor Breath** (Indica, 32% THCA) — it's our heaviest hitter for winding down. If you want something a little lighter, **Ice Cream Cake** (Indica, 28% THCA) has a smooth, creamy flavor that's perfect for evening use. Want me to add either to your cart?";
  }

  if (lower.includes("energy") || lower.includes("daytime") || lower.includes("focus") || lower.includes("sativa")) {
    return "For daytime energy, check out **Lemon Zkittlez** (Sativa, 26% THCA) — super uplifting with a citrusy kick. If you want a concentrate, our **Pineapple Express** (Sativa, 85% THCA) is incredible for focus. Both great choices for staying productive!";
  }

  if (lower.includes("strong") || lower.includes("potent") || lower.includes("highest")) {
    return "Our strongest flower is **Motor Breath** at 32% THCA — it's a heavy indica that hits hard. For concentrates, **MAC** (88% THCA) is the most potent we carry. Fair warning: both are for experienced users! Want to start with something a little more mellow?";
  }

  if (lower.includes("beginner") || lower.includes("first") || lower.includes("new") || lower.includes("light")) {
    return "Welcome! For beginners, I'd suggest **Hi Berry Chew** (Hybrid, 25% THCA) — it's balanced and approachable with a fruity flavor. Our **Premium Pre-Rolls** are also great for trying things out without committing to a larger quantity. Start low and go slow!";
  }

  if (lower.includes("hybrid") || lower.includes("balanced")) {
    return "For a well-balanced hybrid, **Gelato 33** (29% THCA) is a fan favorite — great flavor, relaxed but not sleepy. **Whiteboy Cookies** (28% THCA) and **Mochi** (29% THCA) are also excellent hybrid choices. Can't go wrong with any of those!";
  }

  if (lower.includes("concentrate") || lower.includes("dab") || lower.includes("wax")) {
    return "We've got some fire concentrates! **MAC** (Hybrid, 88% THCA) is our top seller, **Cookies N Creme** (Hybrid, 86% THCA) has an amazing flavor profile, and **Pineapple Express** (Sativa, 85% THCA) is great for a daytime dab. Which vibe are you going for?";
  }

  if (lower.includes("pre-roll") || lower.includes("preroll") || lower.includes("joint")) {
    return "Our **Premium Pre-Rolls** come in a Hybrid blend at 28% THCA — convenient and consistent. They're perfect for on-the-go or if you just want to try something without grinding and rolling. Grab a 3-pack!";
  }

  if (lower.includes("edible") || lower.includes("gumm")) {
    return "We carry a variety of edibles! Check out the **Products** page for our full selection of gummies and chews. Edibles take 30-90 minutes to kick in, so start with a low dose. Want me to point you to a specific type?";
  }

  if (lower.includes("thank") || lower.includes("thanks")) {
    return "You're welcome! Happy to help. Feel free to ask anytime — and when you're ready to order, just hit up the Products page. Enjoy! 🌿";
  }

  return "Great question! Based on our current menu, I can help you find the right **flower**, **concentrate**, **pre-roll**, or **edible** for your needs. Tell me more about what you're looking for — are you after relaxation, energy, pain relief, or something social? Or just tell me what you've enjoyed before and I'll find something similar.";
}

// ─── Chat Page ────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const aiMsg: Message = {
      id: `ai_${Date.now()}`,
      role: "assistant",
      content: getAiResponse(message),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

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

          {/* Typing indicator */}
          {isTyping && (
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
