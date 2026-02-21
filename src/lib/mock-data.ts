/**
 * Mock product data used as a fallback when the database is unavailable.
 * This mirrors the real products from prisma/seed.ts so the customer-facing
 * pages always show something even without a running PostgreSQL instance.
 *
 * TODO: Remove this fallback once the production database is deployed.
 */

export interface MockProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  strainType: string | null;
  thcPercentage: number | null;
  cbdPercentage: number | null;
  inStock: boolean;
  isFeatured: boolean;
  weight: string | null;
  descriptionEn: string;
  category: {
    nameEn: string;
    slug: string;
  };
  avgRating: number;
  _count: {
    reviews: number;
  };
}

export interface MockCategory {
  id: string;
  nameEn: string;
  slug: string;
  _count: {
    products: number;
  };
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "cat-flower", nameEn: "Flower", slug: "flower", _count: { products: 9 } },
  { id: "cat-concentrates", nameEn: "Concentrates", slug: "concentrates", _count: { products: 4 } },
  { id: "cat-pre-rolls", nameEn: "Pre-Rolls", slug: "pre-rolls", _count: { products: 1 } },
  { id: "cat-edibles", nameEn: "Edibles", slug: "edibles", _count: { products: 0 } },
  { id: "cat-vapes", nameEn: "Vapes", slug: "vapes", _count: { products: 0 } },
  { id: "cat-tinctures", nameEn: "Tinctures & Oils", slug: "tinctures", _count: { products: 0 } },
  { id: "cat-accessories", nameEn: "Accessories", slug: "accessories", _count: { products: 0 } },
];

const flower = { nameEn: "Flower", slug: "flower" };
const concentrates = { nameEn: "Concentrates", slug: "concentrates" };
const preRolls = { nameEn: "Pre-Rolls", slug: "pre-rolls" };

// TODO: Update prices when owner provides actual pricing
export const MOCK_PRODUCTS: MockProduct[] = [
  // ── Flower (9 products) ────────────────────────────
  {
    id: "prod-whiteboy-cookies",
    name: "Whiteboy Cookies",
    price: 0,
    imageUrl: "/images/products/White Boy Cookies.jpg",
    strainType: "HYBRID",
    thcPercentage: 28.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "3.5g",
    descriptionEn: "A potent hybrid strain with a sweet, earthy aroma. Known for its relaxing effects and creamy cookie flavor profile. Perfect for evening relaxation.",
    category: flower,
    avgRating: 4.8,
    _count: { reviews: 12 },
  },
  {
    id: "prod-lemon-zkittlez",
    name: "Lemon Zkittlez",
    price: 0,
    imageUrl: "/images/products/Lenon Zkittles.jpg",
    strainType: "SATIVA",
    thcPercentage: 26.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "3.5g",
    descriptionEn: "Bright citrus notes meet sweet candy flavors in this sativa-dominant hybrid. Uplifting and energizing effects with a tangy lemon kick.",
    category: flower,
    avgRating: 4.6,
    _count: { reviews: 8 },
  },
  {
    id: "prod-hi-berry-chew",
    name: "Hi Berry Chew",
    price: 0,
    imageUrl: "/images/products/Hi Berry Chew.jpg",
    strainType: "HYBRID",
    thcPercentage: 25.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: false,
    weight: "3.5g",
    descriptionEn: "Sweet berry flavors dominate this indica-leaning hybrid. Smooth smoke with relaxing body effects and a fruity berry finish.",
    category: flower,
    avgRating: 4.5,
    _count: { reviews: 6 },
  },
  {
    id: "prod-mac-flurry",
    name: "Mac Flurry",
    price: 0,
    imageUrl: "/images/products/Mac Flurry.jpg",
    strainType: "HYBRID",
    thcPercentage: 30.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "3.5g",
    descriptionEn: "A premium hybrid with creamy vanilla notes and potent effects. Dense, frosty buds with exceptional bag appeal and powerful relaxation.",
    category: flower,
    avgRating: 4.9,
    _count: { reviews: 15 },
  },
  {
    id: "prod-gelato-33",
    name: "Gelato 33",
    price: 0,
    imageUrl: "/images/products/Gelato 33.jpg",
    strainType: "HYBRID",
    thcPercentage: 29.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "3.5g",
    descriptionEn: "The classic Gelato phenotype with sweet dessert flavors and balanced hybrid effects. Smooth, creamy smoke with hints of citrus and berries.",
    category: flower,
    avgRating: 4.7,
    _count: { reviews: 20 },
  },
  {
    id: "prod-donut-shop",
    name: "Donut Shop",
    price: 0,
    imageUrl: "/images/products/Donut Shop.jpg",
    strainType: "INDICA",
    thcPercentage: 27.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: false,
    weight: "3.5g",
    descriptionEn: "Indulgent bakery flavors with sweet dough and glaze notes. This indica-dominant strain delivers deep relaxation and stress relief.",
    category: flower,
    avgRating: 4.4,
    _count: { reviews: 9 },
  },
  {
    id: "prod-ice-cream-cake",
    name: "Ice Cream Cake",
    price: 0,
    imageUrl: "/images/products/Ice Cream Cake.jpg",
    strainType: "INDICA",
    thcPercentage: 28.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "3.5g",
    descriptionEn: "Rich, creamy vanilla and sweet dough flavors make this indica a dessert lover's dream. Heavy-hitting relaxation for evening use.",
    category: flower,
    avgRating: 4.8,
    _count: { reviews: 18 },
  },
  {
    id: "prod-motor-breath",
    name: "Motor Breath",
    price: 0,
    imageUrl: "/images/products/Motor Breath.jpg",
    strainType: "INDICA",
    thcPercentage: 32.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: false,
    weight: "3.5g",
    descriptionEn: "Powerful indica with diesel and earthy notes. Known for its strong sedative effects and pungent aroma. Perfect for deep relaxation.",
    category: flower,
    avgRating: 4.6,
    _count: { reviews: 7 },
  },
  {
    id: "prod-mochi",
    name: "Mochi",
    price: 0,
    imageUrl: "/images/products/mochi.jpg",
    strainType: "HYBRID",
    thcPercentage: 29.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "3.5g",
    descriptionEn: "Exotic hybrid with sweet, fruity flavors and a smooth finish. Balanced effects provide both mental clarity and physical relaxation.",
    category: flower,
    avgRating: 4.7,
    _count: { reviews: 11 },
  },

  // ── Concentrates (4 products) ──────────────────────
  {
    id: "prod-pineapple-express",
    name: "Pineapple Express",
    price: 0,
    imageUrl: "/images/products/Pineapple Express.jpg",
    strainType: "SATIVA",
    thcPercentage: 85.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "1g",
    descriptionEn: "Tropical pineapple flavors with energizing sativa effects. Premium live resin concentrate with full terpene preservation.",
    category: concentrates,
    avgRating: 4.9,
    _count: { reviews: 14 },
  },
  {
    id: "prod-mac",
    name: "MAC",
    price: 0,
    imageUrl: "/images/products/MAC.jpg",
    strainType: "HYBRID",
    thcPercentage: 88.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "1g",
    descriptionEn: "Miracle Alien Cookies concentrate with complex flavors and potent effects. High-quality extraction with exceptional purity.",
    category: concentrates,
    avgRating: 4.8,
    _count: { reviews: 10 },
  },
  {
    id: "prod-cookies-n-creme",
    name: "Cookies N Creme",
    price: 0,
    imageUrl: "/images/products/Cookie N Creme.jpg",
    strainType: "HYBRID",
    thcPercentage: 86.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: false,
    weight: "1g",
    descriptionEn: "Sweet vanilla cookie flavors in a smooth, potent concentrate. Hybrid effects provide balanced relaxation and euphoria.",
    category: concentrates,
    avgRating: 4.5,
    _count: { reviews: 5 },
  },
  {
    id: "prod-sour-tangie",
    name: "Sour Tangie",
    price: 0,
    imageUrl: "/images/products/Sour Tanger.jpg",
    strainType: "SATIVA",
    thcPercentage: 84.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: false,
    weight: "1g",
    descriptionEn: "Bright citrus and tangerine flavors with uplifting sativa effects. Premium concentrate with intense terpene profile.",
    category: concentrates,
    avgRating: 4.6,
    _count: { reviews: 4 },
  },

  // ── Pre-Rolls (1 product) ──────────────────────────
  {
    id: "prod-premium-pre-roll",
    name: "Premium Pre-Roll",
    price: 0,
    imageUrl: "/images/products/Pre Roll.jpg",
    strainType: "HYBRID",
    thcPercentage: 28.0,
    cbdPercentage: null,
    inStock: true,
    isFeatured: true,
    weight: "1g",
    descriptionEn: "Expertly rolled and ready to enjoy. Featuring our finest THCA flower in a convenient pre-roll format. Perfect for on-the-go relaxation.",
    category: preRolls,
    avgRating: 4.7,
    _count: { reviews: 22 },
  },
];

export const MOCK_BANNERS = [
  {
    id: "banner-1",
    titleEn: "Premium Hemp, Ready When You Are",
    titleEs: "Cáñamo Premium, Listo Cuando Tú Lo Estés",
    bodyEn: "Browse our curated selection, reserve your favorites, and pick up at your convenience. No payment required online.",
    bodyEs: "Explora nuestra selección curada, reserva tus favoritos y recoge a tu conveniencia. No se requiere pago en línea.",
    imageUrl: null,
    isActive: true,
    sortOrder: 1,
  },
];
