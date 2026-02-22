import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductDetailClient from "@/components/customer/ProductDetailClient";

interface ProductDetailPageProps {
  params: { id: string };
}

async function getProduct(id: string) {
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

    if (!product) return null;

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
    return null;
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

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const product = await getProduct(params.id);
  if (!product) return { title: "Product Not Found" };

  const title = `${product.name} | THC Plus`;
  const description =
    product.descriptionEn ||
    `${product.name} - Premium hemp product available at THC Plus Houston. Browse and reserve for will-call pickup.`;
  const url = `https://order.thcplus.com/products/${product.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "THC Plus",
      ...(product.imageUrl && {
        images: [
          {
            url: product.imageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      }),
    },
    twitter: {
      card: product.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(product.imageUrl && {
        images: [product.imageUrl],
      }),
    },
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
