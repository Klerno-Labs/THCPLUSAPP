import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── GET: Customer fetches their active alerts ──────────
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.stockAlert.findMany({
      where: {
        customerId: session.user.id,
        notified: false,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            inStock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("[GET /api/stock-alerts]", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// ─── POST: Customer subscribes to a back-in-stock alert ─
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
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

    // Upsert — if the alert already exists (and was previously notified), reset it
    const alert = await prisma.stockAlert.upsert({
      where: {
        customerId_productId: {
          customerId: session.user.id,
          productId,
        },
      },
      update: {
        notified: false,
      },
      create: {
        customerId: session.user.id,
        productId,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("[POST /api/stock-alerts]", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Customer removes an alert ──────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    await prisma.stockAlert.deleteMany({
      where: {
        customerId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/stock-alerts]", error);
    return NextResponse.json(
      { error: "Failed to remove alert" },
      { status: 500 }
    );
  }
}
