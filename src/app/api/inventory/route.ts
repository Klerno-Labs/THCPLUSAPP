import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Parse weight string like "3.5g" or "1g" into grams */
function parseGrams(weight: string | null): number | null {
  if (!weight) return null;
  const match = weight.match(/([\d.]+)\s*g/i);
  return match ? parseFloat(match[1]) : null;
}

// ─── GET: Inventory Dashboard (Owner Only) ──────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: { select: { nameEn: true } },
      },
      orderBy: { name: "asc" },
    });

    // Calculate per-product inventory data
    const inventoryProducts = products.map((p) => {
      const margin =
        p.costPrice != null && p.price > 0
          ? Math.round(((p.price - p.costPrice) / p.price) * 100)
          : null;
      const unitProfit =
        p.costPrice != null ? Math.round((p.price - p.costPrice) * 100) / 100 : null;
      const totalRetailValue = Math.round(p.price * p.quantity * 100) / 100;
      const totalCostValue =
        p.costPrice != null
          ? Math.round(p.costPrice * p.quantity * 100) / 100
          : null;
      const totalProfit =
        totalCostValue != null
          ? Math.round((totalRetailValue - totalCostValue) * 100) / 100
          : null;

      const gramsPerUnit = parseGrams(p.weight);
      const totalGrams =
        gramsPerUnit != null
          ? Math.round(gramsPerUnit * p.quantity * 100) / 100
          : null;

      return {
        id: p.id,
        name: p.name,
        category: p.category.nameEn,
        quantity: p.quantity,
        gramsPerUnit,
        totalGrams,
        price: p.price,
        costPrice: p.costPrice,
        margin,
        unitProfit,
        totalRetailValue,
        totalCostValue,
        totalProfit,
        inStock: p.inStock,
        weight: p.weight,
        lowStock: p.quantity > 0 && p.quantity <= 5,
        imageUrl: p.imageUrl,
      };
    });

    // Summary KPIs
    const totalProducts = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalGrams = products.reduce((sum, p) => {
      const g = parseGrams(p.weight);
      return sum + (g != null ? g * p.quantity : 0);
    }, 0);
    const totalRetailValue = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const productsWithCost = products.filter((p) => p.costPrice != null);
    const totalCostValue = productsWithCost.reduce(
      (sum, p) => sum + (p.costPrice ?? 0) * p.quantity,
      0
    );
    const totalPotentialProfit =
      productsWithCost.length > 0
        ? Math.round((totalRetailValue - totalCostValue) * 100) / 100
        : null;
    const avgMargin =
      productsWithCost.length > 0
        ? Math.round(
            ((totalRetailValue - totalCostValue) / totalRetailValue) * 100
          )
        : null;
    const lowStockCount = products.filter(
      (p) => p.quantity > 0 && p.quantity <= 5
    ).length;
    const outOfStockCount = products.filter(
      (p) => p.quantity === 0 || !p.inStock
    ).length;

    return NextResponse.json({
      summary: {
        totalProducts,
        totalUnits,
        totalGrams: Math.round(totalGrams * 100) / 100,
        totalRetailValue: Math.round(totalRetailValue * 100) / 100,
        totalCostValue: Math.round(totalCostValue * 100) / 100,
        totalPotentialProfit,
        avgMargin,
        lowStockCount,
        outOfStockCount,
      },
      products: inventoryProducts,
    });
  } catch (error) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
