import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── GET: List User's Favorites ─────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { customerId: session.user.id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      favorites.map((f) => ({
        id: f.id,
        productId: f.product.id,
        product: f.product,
        createdAt: f.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/favorites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// ─── POST: Add Favorite ────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Upsert to handle duplicates
    const favorite = await prisma.favorite.upsert({
      where: {
        customerId_productId: {
          customerId: session.user.id,
          productId,
        },
      },
      create: {
        customerId: session.user.id,
        productId,
      },
      update: {},
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("POST /api/favorites error:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Remove Favorite ───────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        customerId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/favorites error:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
