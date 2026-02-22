import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// ─── GET: Single Product ────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

    const { reviews, ...productData } = product;
    return NextResponse.json({
      ...productData,
      avgRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update Product ──────────────────────────────
export async function PATCH(
  request: NextRequest,
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

    const body = await request.json();

    // Validate PATCH fields against partial product schema
    const partialSchema = productSchema.partial();
    const parsed = partialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Build update data from validated and allowed fields
    const allowed = [
      "name",
      "nameEs",
      "categoryId",
      "descriptionEn",
      "descriptionEs",
      "price",
      "thcPercentage",
      "cbdPercentage",
      "strainType",
      "weight",
      "imageUrl",
      "inStock",
      "quantity",
      "isFeatured",
      "sortOrder",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowed) {
      if (parsed.data[key as keyof typeof parsed.data] !== undefined) {
        updateData[key] = parsed.data[key as keyof typeof parsed.data];
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Remove Product ─────────────────────────────
export async function DELETE(
  _request: NextRequest,
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

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete: product has associated orders, reviews, or deals. Remove those first." },
        { status: 409 }
      );
    }
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
