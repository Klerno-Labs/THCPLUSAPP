import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// ─── GET: List Products ─────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const categoryId = searchParams.get("categoryId");
    const inStock = searchParams.get("inStock");
    const strainType = searchParams.get("strainType");
    const search = searchParams.get("search");

    // Sort
    const sortBy = searchParams.get("sortBy") || "sortOrder"; // sortOrder, price, name
    const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    );
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (inStock !== null && inStock !== undefined) {
      where.inStock = inStock === "true";
    }

    if (strainType) {
      where.strainType = strainType as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameEs: { contains: search, mode: "insensitive" } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case "price":
        orderBy.price = sortDir;
        break;
      case "name":
        orderBy.name = sortDir;
        break;
      case "createdAt":
        orderBy.createdAt = sortDir;
        break;
      case "sortOrder":
      default:
        orderBy.sortOrder = sortDir;
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productIds = products.map((p) => p.id);
    const avgRatings = await prisma.review.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _avg: { rating: true },
    });

    const ratingsMap = new Map(
      avgRatings.map((r) => [r.productId, r._avg.rating || 0])
    );

    const productsWithRatings = products.map((product) => ({
      ...product,
      avgRating: ratingsMap.get(product.id) || 0,
    }));

    return NextResponse.json({
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ─── POST: Create Product (Admin) ───────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        nameEs: data.nameEs,
        categoryId: data.categoryId,
        descriptionEn: data.descriptionEn,
        descriptionEs: data.descriptionEs,
        price: data.price,
        costPrice: data.costPrice,
        thcPercentage: data.thcPercentage,
        cbdPercentage: data.cbdPercentage,
        strainType: data.strainType as any,
        weight: data.weight,
        imageUrl: data.imageUrl,
        inStock: data.inStock,
        quantity: data.quantity,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
