import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: Fetch current user's account data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    // If no profile found (e.g. staff user), return empty data
    if (!profile) {
      return NextResponse.json({
        profile: null,
        orders: [],
        favoriteCount: 0,
      });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.user.id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalItems: true,
        createdAt: true,
        items: {
          select: {
            unitPriceAtOrder: true,
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const favoriteCount = await prisma.favorite.count({
      where: { customerId: session.user.id },
    });

    return NextResponse.json({
      profile: profile
        ? {
            ...profile,
            createdAt: profile.createdAt.toISOString(),
          }
        : null,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalItems: o.totalItems,
        totalAmount: o.items.reduce(
          (sum, item) => sum + item.unitPriceAtOrder * item.quantity,
          0
        ),
        createdAt: o.createdAt.toISOString(),
      })),
      favoriteCount,
    });
  } catch (error) {
    console.error("GET /api/account error:", error);
    return NextResponse.json(
      { error: "Failed to load account" },
      { status: 500 }
    );
  }
}

// PATCH: Update profile settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, preferredLanguage } = body;

    const updateData: Record<string, string | null> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (preferredLanguage !== undefined)
      updateData.preferredLanguage = preferredLanguage;

    await prisma.profile.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/account error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
