import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── GET: Public — fetch active deals ───────────────────
export async function GET() {
  try {
    const now = new Date();

    const deals = await prisma.deal.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gt: now },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameEs: true,
            price: true,
            imageUrl: true,
            categoryId: true,
            inStock: true,
            strainType: true,
          },
        },
      },
      orderBy: { endsAt: "asc" },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error("[GET /api/deals]", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

// ─── POST: Admin — create a new deal ────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["OWNER", "MANAGER"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, titleEn, titleEs, badgeText, startsAt, endsAt } = body;

    if (!productId || !titleEn || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: "Missing required fields: productId, titleEn, startsAt, endsAt" },
        { status: 400 }
      );
    }

    // Validate dates
    const startsAtDate = new Date(startsAt);
    const endsAtDate = new Date(endsAt);

    if (isNaN(startsAtDate.getTime()) || isNaN(endsAtDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format for startsAt or endsAt" },
        { status: 400 }
      );
    }

    if (endsAtDate <= startsAtDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const deal = await prisma.deal.create({
      data: {
        productId,
        titleEn,
        titleEs: titleEs || null,
        badgeText: badgeText || null,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isActive: true,
      },
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

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error("[POST /api/deals]", error);
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
