import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── PATCH: Admin — update a deal ───────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["OWNER", "MANAGER"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // Only allow updating specific fields
    const allowedFields = [
      "titleEn",
      "titleEs",
      "badgeText",
      "startsAt",
      "endsAt",
      "isActive",
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "startsAt" || field === "endsAt") {
          const d = new Date(body[field]);
          if (isNaN(d.getTime())) {
            return NextResponse.json({ error: `Invalid ${field} date` }, { status: 400 });
          }
          updateData[field] = d;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            categoryId: true,
          },
        },
      },
    });

    return NextResponse.json(deal);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }
    console.error("[PATCH /api/deals/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Admin — delete a deal ──────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["OWNER", "MANAGER"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.deal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }
    console.error("[DELETE /api/deals/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
