import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ─── POST: Submit a Review ──────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const customerId = (session?.user as { id?: string })?.id;
    const role = (session?.user as { role?: string })?.role;

    if (!customerId || role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "You must be signed in to leave a review" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, rating, body: reviewBody } = parsed.data;

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

    // Check if customer already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { productId, customerId },
    });

    if (existing) {
      // Update existing review
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, body: reviewBody || null },
      });
      return NextResponse.json(updated);
    }

    // Check if customer has purchased this product (verified purchase)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          customerId,
          status: "PICKED_UP",
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        customerId,
        rating,
        body: reviewBody || null,
        isVerifiedPurchase: !!hasPurchased,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

// ─── GET: Reviews for a product ─────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
