// ─── Active In-Store Deals ───────────────────────────────
// Hardcoded deal definitions. These are applied automatically
// in the cart when quantity thresholds are met.

export interface CartDeal {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  badgeText: string;
  /** Category slug to match (e.g. "pre-rolls") */
  categorySlug: string;
  /** Category display name fallback for client matching */
  categoryName: string;
  /** Buy this many to trigger the deal */
  buyQty: number;
  /** Get this many free when triggered */
  freeQty: number;
}

export const ACTIVE_DEALS: CartDeal[] = [
  {
    id: "preroll-b2g1",
    label: "Buy 2, Get 1 FREE!",
    shortLabel: "B2G1 FREE",
    description: "Buy any 2 pre-rolls and get your 3rd one completely free!",
    badgeText: "BUY 2 GET 1 FREE",
    categorySlug: "pre-rolls",
    categoryName: "Pre-Rolls",
    buyQty: 2,
    freeQty: 1,
  },
];

/** Check if a product matches a deal by category */
export function productMatchesDeal(
  product: { category?: { slug?: string; nameEn?: string } | null },
  deal: CartDeal
): boolean {
  if (!product.category) return false;
  if (product.category.slug === deal.categorySlug) return true;
  if (product.category.nameEn === deal.categoryName) return true;
  return false;
}

/** Find the deal that applies to a product */
export function getDealForProduct(
  product: { category?: { slug?: string; nameEn?: string } | null }
): CartDeal | null {
  return ACTIVE_DEALS.find((deal) => productMatchesDeal(product, deal)) ?? null;
}

export interface DealDiscount {
  dealId: string;
  label: string;
  freeItems: number;
  savings: number;
}

/**
 * Calculate deal discounts for a set of cart items.
 * Each item needs product info with category and price.
 */
export function calculateCartDeals(
  items: Array<{
    quantity: number;
    product: {
      price: number;
      category?: { slug?: string; nameEn?: string } | null;
    };
  }>
): DealDiscount[] {
  const discounts: DealDiscount[] = [];

  for (const deal of ACTIVE_DEALS) {
    const groupSize = deal.buyQty + deal.freeQty;

    // Find all cart items matching this deal's category
    const matchingItems = items.filter((item) =>
      productMatchesDeal(item.product as any, deal)
    );

    // Sum total quantity of matching items
    const totalQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);

    if (totalQty < groupSize) continue;

    // Calculate free items: for every group of (buyQty + freeQty), freeQty are free
    const freeItems = Math.floor(totalQty / groupSize) * deal.freeQty;

    // Use the lowest price among matching items for the free ones
    const lowestPrice = Math.min(
      ...matchingItems.map((item) => Number(item.product.price) || 0)
    );

    const savings = freeItems * lowestPrice;

    if (savings > 0) {
      discounts.push({
        dealId: deal.id,
        label: deal.label,
        freeItems,
        savings,
      });
    }
  }

  return discounts;
}
