import { db } from "@/lib/db";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import ProductsGrid from "@/components/customer/ProductsGrid";

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

    if (products.length === 0) return MOCK_PRODUCTS;

    const withRatings = await Promise.all(
      products.map(async (product) => {
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
        };
      })
    );

    return withRatings;
  } catch {
    return MOCK_PRODUCTS;
  }
}

async function getCategories() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    if (categories.length === 0) return MOCK_CATEGORIES;
    return categories;
  } catch {
    return MOCK_CATEGORIES;
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
