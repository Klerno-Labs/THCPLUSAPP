import { Metadata } from "next";
import { db } from "@/lib/db";
import HomeHero from "@/components/customer/HomeHero";

export const dynamic = "force-dynamic";
import FeaturedProducts from "@/components/customer/FeaturedProducts";
import CategoryGrid from "@/components/customer/CategoryGrid";
import AiBudtenderCTA from "@/components/customer/AiBudtenderCTA";
import ActiveOrderCard from "@/components/customer/ActiveOrderCard";
import TodaysDeals from "@/components/customer/TodaysDeals";
import QuizCTA from "@/components/customer/QuizCTA";

export const metadata: Metadata = {
  title: "THC Plus | Premium Hemp Products Houston",
  description:
    "Browse and reserve premium THCA flower, concentrates, and pre-rolls for will-call pickup at THC Plus Houston.",
  openGraph: {
    title: "THC Plus | Premium Hemp Products",
    description:
      "Reserve premium THCA products for pickup in Houston. Browse our menu and order ahead.",
    type: "website",
  },
};

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

    const productIds = products.map((p) => p.id);
    const ratings = await db.review.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
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
      avgRating: ratingMap.get(product.id) ?? 0,
    }));
  } catch (e) {
    console.error("getFeaturedProducts error:", e);
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
      <TodaysDeals />
      <FeaturedProducts products={featuredProducts} />
      <CategoryGrid categories={categories} />
      <QuizCTA />
      <AiBudtenderCTA />
    </div>
  );
}
