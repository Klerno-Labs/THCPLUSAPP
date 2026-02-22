import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { RedemptionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// ─── GET: Staff Fetches Redemptions ──────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER", "STAFF"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || "PENDING") as RedemptionStatus;

    const redemptions = await prisma.redemption.findMany({
      where: { status },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            loyaltyTier: true,
          },
        },
      },
      orderBy: {
        createdAt: status === "PENDING" ? "asc" : "desc",
      },
    });

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("GET /api/redemptions/admin error:", error);
    return NextResponse.json(
      { error: "Failed to fetch redemptions" },
      { status: 500 }
    );
  }
}
