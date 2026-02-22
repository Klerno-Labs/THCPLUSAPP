import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: Aggregate spending insights for the current customer
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const customerId = session.user.id;

    // Fetch profile for loyalty info
    const profile = await prisma.profile.findUnique({
      where: { id: customerId },
      select: {
        loyaltyPoints: true,
        loyaltyTier: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get all PICKED_UP orders with items
    const completedOrders = await prisma.order.findMany({
      where: {
        customerId,
        status: "PICKED_UP",
      },
      select: {
        id: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            unitPriceAtOrder: true,
            productId: true,
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Total spent
    let totalSpent = 0;
    const productCountMap: Record<
      string,
      { name: string; imageUrl: string | null; count: number }
    > = {};

    for (const order of completedOrders) {
      for (const item of order.items) {
        const lineTotal = item.unitPriceAtOrder * item.quantity;
        totalSpent += lineTotal;

        // Track product frequency
        if (productCountMap[item.productId]) {
          productCountMap[item.productId].count += item.quantity;
        } else {
          productCountMap[item.productId] = {
            name: item.product.name,
            imageUrl: item.product.imageUrl,
            count: item.quantity,
          };
        }
      }
    }

    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Top 5 most ordered products
    const topProducts = Object.entries(productCountMap)
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        imageUrl: data.imageUrl,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Points earned vs redeemed
    const loyaltyTransactions = await prisma.loyaltyTransaction.findMany({
      where: { customerId },
      select: {
        points: true,
        type: true,
      },
    });

    let pointsEarned = 0;
    let pointsRedeemed = 0;
    for (const tx of loyaltyTransactions) {
      if (tx.type === "EARNED" || tx.type === "BONUS") {
        pointsEarned += tx.points;
      } else if (tx.type === "REDEEMED") {
        pointsRedeemed += Math.abs(tx.points);
      }
    }

    // Monthly spending trend (last 6 months)
    const now = new Date();
    const monthlySpending: { month: string; amount: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
        999
      );

      const monthLabel = monthDate.toLocaleDateString("en-US", {
        month: "short",
      });

      let monthTotal = 0;
      for (const order of completedOrders) {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= monthDate && orderDate <= monthEnd) {
          for (const item of order.items) {
            monthTotal += item.unitPriceAtOrder * item.quantity;
          }
        }
      }

      monthlySpending.push({
        month: monthLabel,
        amount: Math.round(monthTotal * 100) / 100,
      });
    }

    // Loyalty tier progress
    const tierThresholds = {
      SEEDLING: { min: 0, next: 25, nextTier: "GROWER" },
      GROWER: { min: 25, next: 100, nextTier: "CULTIVATOR" },
      CULTIVATOR: { min: 100, next: 500, nextTier: "MASTER_GROWER" },
      MASTER_GROWER: { min: 500, next: 500, nextTier: null },
    };

    const currentTierInfo =
      tierThresholds[profile.loyaltyTier as keyof typeof tierThresholds] ||
      tierThresholds.SEEDLING;

    const tierProgress =
      profile.loyaltyTier === "MASTER_GROWER"
        ? 100
        : Math.min(
            100,
            Math.round(
              ((profile.loyaltyPoints - currentTierInfo.min) /
                (currentTierInfo.next - currentTierInfo.min)) *
                100
            )
          );

    return NextResponse.json({
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      pointsEarned,
      pointsRedeemed,
      currentPoints: profile.loyaltyPoints,
      loyaltyTier: profile.loyaltyTier,
      tierProgress,
      nextTier: currentTierInfo.nextTier,
      pointsToNextTier:
        profile.loyaltyTier === "MASTER_GROWER"
          ? 0
          : currentTierInfo.next - profile.loyaltyPoints,
      topProducts,
      monthlySpending,
    });
  } catch (error) {
    console.error("GET /api/account/insights error:", error);
    return NextResponse.json(
      { error: "Failed to load insights" },
      { status: 500 }
    );
  }
}
