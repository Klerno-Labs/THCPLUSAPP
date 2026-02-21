import { db } from "@/lib/db";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BANNERS } from "@/lib/mock-data";
import HomeHero from "@/components/customer/HomeHero";
import FeaturedProducts from "@/components/customer/FeaturedProducts";
import CategoryGrid from "@/components/customer/CategoryGrid";
import AiBudtenderCTA from "@/components/customer/AiBudtenderCTA";
import ActiveOrderCard from "@/components/customer/ActiveOrderCard";

async function getFeaturedProducts() {
  try {
    const products = await db.product.findMany({
      where: { isFeatured: true, inStock: true },
      include: {
        category: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { sortOrder: "asc" },
      take: 10,
    });

    if (products.length === 0) {
      return MOCK_PRODUCTS.filter((p) => p.isFeatured);
    }

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
          avgRating: agg._avg.rating ?? 0,
        };
      })
    );

    return withRatings;
  } catch {
    return MOCK_PRODUCTS.filter((p) => p.isFeatured);
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

async function getActiveBanners() {
  try {
    const banners = await db.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 5,
    });
    if (banners.length === 0) return MOCK_BANNERS;
    return banners;
  } catch {
    return MOCK_BANNERS;
  }
}

export default async function HomePage() {
  const [featuredProducts, categories, banners] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getActiveBanners(),
  ]);

  return (
    <div>
      <HomeHero banners={banners} />
      <ActiveOrderCard />
      <FeaturedProducts products={featuredProducts} />
      <CategoryGrid categories={categories} />
      <AiBudtenderCTA />
    </div>
  );
}
