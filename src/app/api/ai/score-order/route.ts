import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scoreOrderInternal } from "@/lib/ai-scoring";
import type { ScoreOrderInput } from "@/lib/ai-scoring";

// ─── POST: AI Order Priority Scoring (Staff API) ────────
export async function POST(request: NextRequest) {
  try {
    // Require staff authentication
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER", "STAFF"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ScoreOrderInput;

    if (!body.orderId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "orderId and items are required" },
        { status: 400 }
      );
    }

    const scoreData = await scoreOrderInternal(body);
    return NextResponse.json(scoreData);
  } catch (error) {
    console.error("POST /api/ai/score-order error:", error);
    return NextResponse.json(
      { error: "Failed to score order" },
      { status: 500 }
    );
  }
}
