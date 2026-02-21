import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai, ORDER_SCORING_PROMPT } from "@/lib/openai";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import type { AiOrderScore, OrderAiScoredEvent } from "@/types/app.types";

interface ScoreOrderInput {
  orderId: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  customerTier: string | null;
  createdAt: string;
  expiresAt: string | null;
}

// ─── POST: AI Order Priority Scoring ────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScoreOrderInput;
    const { orderId, items, customerTier, createdAt, expiresAt } = body;

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "orderId and items are required" },
        { status: 400 }
      );
    }

    // ── Build scoring context ──
    const itemList = items
      .map(
        (i) =>
          `- ${i.productName} x${i.quantity} ($${i.price.toFixed(2)} each)`
      )
      .join("\n");

    const totalValue = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    const now = new Date();
    const expiresDate = expiresAt ? new Date(expiresAt) : null;
    const hoursUntilExpiry = expiresDate
      ? (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      : null;

    const userPrompt = `ORDER DATA:
- Order ID: ${orderId}
- Created: ${createdAt}
- Expires: ${expiresAt || "N/A"}
- Hours until expiry: ${hoursUntilExpiry?.toFixed(1) || "N/A"}
- Customer loyalty tier: ${customerTier || "Guest (no tier)"}
- Total items: ${totalItemCount}
- Total value: $${totalValue.toFixed(2)}

ITEMS:
${itemList}

Score this order 1-10 and return your analysis as JSON with keys: score, flags, reason`;

    // ── Call GPT-4o ──
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: ORDER_SCORING_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let scoreData: AiOrderScore;

    try {
      const parsed = JSON.parse(rawContent);
      scoreData = {
        score: Math.min(10, Math.max(1, parseInt(parsed.score, 10) || 5)),
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        reason: parsed.reason || "No reason provided",
      };
    } catch {
      console.error("Failed to parse AI score response:", rawContent);
      scoreData = {
        score: 5,
        flags: ["parse_error"],
        reason: "AI scoring response could not be parsed",
      };
    }

    // ── Update order with AI priority score ──
    await prisma.order.update({
      where: { id: orderId },
      data: { aiPriorityScore: scoreData.score },
    });

    // ── Trigger Pusher event on admin alerts ──
    const alertPayload: OrderAiScoredEvent = {
      orderId,
      score: scoreData.score,
      flags: scoreData.flags,
    };

    await pusherServer.trigger(
      CHANNELS.adminAlerts,
      EVENTS.orderAiScored,
      alertPayload
    );

    return NextResponse.json(scoreData);
  } catch (error) {
    console.error("POST /api/ai/score-order error:", error);
    return NextResponse.json(
      { error: "Failed to score order" },
      { status: 500 }
    );
  }
}
