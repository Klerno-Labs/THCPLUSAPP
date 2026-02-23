import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductsGrid from "@/components/customer/ProductsGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse premium THCA flower, concentrates, pre-rolls, and edibles at THC Plus Houston. Reserve products for will-call pickup -- no payment online.",
  openGraph: {
    title: "Menu | THC Plus Houston",
    description:
      "Browse premium THCA flower, concentrates, pre-rolls, and edibles. Reserve for will-call pickup at THC Plus Houston.",
    url: "https://order.thcplus.com/products",
  },
  alternates: {
    canonical: "https://order.thcplus.com/products",
  },
};

interface ProductsPageProps {
  searchParams: { category?: string };
}

async function getProducts() {
  try {
    const products = await db.product.findMany({
      include: {
        category: true,
        _count: { select: { reviews: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    // Batch avg ratings in a single query instead of N+1 per-product calls
    const ratings = await db.review.groupBy({
      by: ["productId"],
      _avg: { rating: true },
    });
    const ratingMap = new Map(
      ratings.map((r) => [r.productId, r._avg.rating ?? 0])
    );

    return products.map((product) => ({
      ...product,
      price: Number(product.price),
      thcPercentage: product.thcPercentage
        ? Number(product.thcPercentage)
        : null,
      cbdPercentage: product.cbdPercentage
        ? Number(product.cbdPercentage)
        : null,
      avgRating: ratingMap.get(product.id) ?? 0,
    }));
  } catch (e) {
    console.error("getProducts error:", e);
    return [];
  }
}

async function getCategories() {
  try {
    return await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-emerald-900/30 bg-gradient-to-b from-emerald-950/20 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Our Menu
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Browse and reserve premium THCA products for will-call pickup
          </p>
        </div>
      </div>

      <ProductsGrid
        products={products}
        categories={categories}
        initialCategory={searchParams.category}
      />
    </div>
  );
}
