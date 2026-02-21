import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import ProductDetailClient from "@/components/customer/ProductDetailClient";

interface ProductDetailPageProps {
  params: { id: string };
}

async function getProduct(id: string) {
  // Check mock data first (for IDs like "prod-gelato-33")
  const mockProduct = MOCK_PRODUCTS.find((p) => p.id === id);

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            customer: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!product) {
      // Fall back to mock data
      if (!mockProduct) return null;
      return {
        ...mockProduct,
        categoryId: mockProduct.category.slug,
        reviews: [],
      };
    }

    const agg = await db.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
    });

    return {
      ...product,
      price: Number(product.price),
      thcPercentage: product.thcPercentage
        ? Number(product.thcPercentage)
        : null,
      cbdPercentage: product.cbdPercentage
        ? Number(product.cbdPercentage)
        : null,
      avgRating: agg._avg.rating ?? 0,
      reviews: product.reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch {
    // DB unavailable — use mock data
    if (!mockProduct) return null;
    return {
      ...mockProduct,
      categoryId: mockProduct.category.slug,
      reviews: [],
    };
  }
}

async function getRecommendations(productId: string, categorySlug: string) {
  try {
    const products = await db.product.findMany({
      where: {
        id: { not: productId },
        category: { slug: categorySlug },
        inStock: true,
      },
      include: {
        category: true,
      },
      take: 4,
      orderBy: { sortOrder: "asc" },
    });

    if (products.length > 0) {
      return products.map((p) => ({
        ...p,
        price: Number(p.price),
      }));
    }

    // Fall back to mock data
    return MOCK_PRODUCTS
      .filter((p) => p.id !== productId && p.category.slug === categorySlug)
      .slice(0, 4);
  } catch {
    return MOCK_PRODUCTS
      .filter((p) => p.id !== productId && p.category.slug === categorySlug)
      .slice(0, 4);
  }
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const product = await getProduct(params.id);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | THC Plus`,
    description: product.descriptionEn || `${product.name} - Premium hemp product available at THC Plus`,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const recommendations = await getRecommendations(
    product.id,
    product.category?.slug || product.categoryId
  );

  return <ProductDetailClient product={product} recommendations={recommendations} />;
}
