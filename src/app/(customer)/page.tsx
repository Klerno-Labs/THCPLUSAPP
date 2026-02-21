import { db } from "@/lib/db";
import HomeHero from "@/components/customer/HomeHero";

export const dynamic = "force-dynamic";
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

async function getActiveBanners() {
  try {
    return await db.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 5,
    });
  } catch {
    return [];
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
