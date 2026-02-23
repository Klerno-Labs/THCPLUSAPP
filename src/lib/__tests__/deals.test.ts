import { describe, it, expect } from "vitest";
import {
  productMatchesDeal,
  getDealForProduct,
  calculateCartDeals,
  ACTIVE_DEALS,
} from "../deals";

// Grab the pre-roll B2G1 deal for convenience
const prerollDeal = ACTIVE_DEALS[0];

// ─── Helper factories ────────────────────────────────────
function makeProduct(slug?: string, nameEn?: string) {
  return {
    category: slug || nameEn ? { slug, nameEn } : null,
  };
}

function makeCartItem(
  qty: number,
  price: number,
  slug?: string,
  nameEn?: string
) {
  return {
    quantity: qty,
    product: {
      price,
      category: slug || nameEn ? { slug, nameEn } : null,
    },
  };
}

// ─── productMatchesDeal ─────────────────────────────────
describe("productMatchesDeal", () => {
  it("returns true when product slug matches the deal categorySlug", () => {
    const product = makeProduct("pre-rolls");
    expect(productMatchesDeal(product, prerollDeal)).toBe(true);
  });

  it("returns true when product nameEn matches the deal categoryName", () => {
    const product = makeProduct(undefined, "Pre-Rolls");
    expect(productMatchesDeal(product, prerollDeal)).toBe(true);
  });

  it("returns false when neither slug nor nameEn matches", () => {
    const product = makeProduct("edibles", "Edibles");
    expect(productMatchesDeal(product, prerollDeal)).toBe(false);
  });

  it("returns false when product.category is null", () => {
    const product = { category: null };
    expect(productMatchesDeal(product, prerollDeal)).toBe(false);
  });

  it("returns false when product.category is undefined", () => {
    const product = { category: undefined };
    expect(productMatchesDeal(product as any, prerollDeal)).toBe(false);
  });

  it("returns true when slug matches even if nameEn does not", () => {
    const product = makeProduct("pre-rolls", "Something Else");
    expect(productMatchesDeal(product, prerollDeal)).toBe(true);
  });

  it("returns true when nameEn matches even if slug does not", () => {
    const product = makeProduct("wrong-slug", "Pre-Rolls");
    expect(productMatchesDeal(product, prerollDeal)).toBe(true);
  });

  it("is case-sensitive for slug matching", () => {
    const product = makeProduct("Pre-Rolls");
    expect(productMatchesDeal(product, prerollDeal)).toBe(false);
  });
});

// ─── getDealForProduct ──────────────────────────────────
describe("getDealForProduct", () => {
  it("returns the pre-roll deal when product matches", () => {
    const product = makeProduct("pre-rolls");
    const deal = getDealForProduct(product);
    expect(deal).not.toBeNull();
    expect(deal!.id).toBe("preroll-b2g1");
  });

  it("returns null when product has no matching deal", () => {
    const product = makeProduct("edibles");
    expect(getDealForProduct(product)).toBeNull();
  });

  it("returns null when product category is null", () => {
    expect(getDealForProduct({ category: null })).toBeNull();
  });

  it("returns the deal when nameEn matches", () => {
    const product = makeProduct(undefined, "Pre-Rolls");
    const deal = getDealForProduct(product);
    expect(deal).not.toBeNull();
    expect(deal!.id).toBe("preroll-b2g1");
  });
});

// ─── calculateCartDeals ─────────────────────────────────
describe("calculateCartDeals", () => {
  it("returns empty array for empty cart", () => {
    expect(calculateCartDeals([])).toEqual([]);
  });

  it("returns empty array when quantity is 0", () => {
    const items = [makeCartItem(0, 10, "pre-rolls")];
    expect(calculateCartDeals(items)).toEqual([]);
  });

  it("returns empty array when quantity is 1 (below threshold)", () => {
    const items = [makeCartItem(1, 10, "pre-rolls")];
    expect(calculateCartDeals(items)).toEqual([]);
  });

  it("returns empty array when quantity is 2 (below group size of 3)", () => {
    const items = [makeCartItem(2, 10, "pre-rolls")];
    expect(calculateCartDeals(items)).toEqual([]);
  });

  it("returns 1 free item when quantity is 3 (one complete group)", () => {
    const items = [makeCartItem(3, 10, "pre-rolls")];
    const discounts = calculateCartDeals(items);
    expect(discounts).toHaveLength(1);
    expect(discounts[0].freeItems).toBe(1);
    expect(discounts[0].savings).toBe(10);
    expect(discounts[0].dealId).toBe("preroll-b2g1");
    expect(discounts[0].label).toBe("Buy 2, Get 1 FREE!");
  });

  it("returns 1 free item when quantity is 4", () => {
    const items = [makeCartItem(4, 5, "pre-rolls")];
    const discounts = calculateCartDeals(items);
    expect(discounts).toHaveLength(1);
    expect(discounts[0].freeItems).toBe(1);
    expect(discounts[0].savings).toBe(5);
  });

  it("returns 1 free item when quantity is 5", () => {
    const items = [makeCartItem(5, 8, "pre-rolls")];
    const discounts = calculateCartDeals(items);
    expect(discounts).toHaveLength(1);
    expect(discounts[0].freeItems).toBe(1);
    expect(discounts[0].savings).toBe(8);
  });

  it("returns 2 free items when quantity is 6 (two complete groups)", () => {
    const items = [makeCartItem(6, 12, "pre-rolls")];
    const discounts = calculateCartDeals(items);
    expect(discounts).toHaveLength(1);
    expect(discounts[0].freeItems).toBe(2);
    expect(discounts[0].savings).toBe(24);
  });

  it("returns 3 free items when quantity is 9 (three complete groups)", () => {
    const items = [makeCartItem(9, 7, "pre-rolls")];
    const discounts = calculateCartDeals(items);
    expect(discounts[0].freeItems).toBe(3);
    expect(discounts[0].savings).toBe(21);
  });

  it("ignores non-matching category items", () => {
    const items = [makeCartItem(5, 20, "edibles")];
    expect(calculateCartDeals(items)).toEqual([]);
  });

  it("sums quantities across multiple matching items", () => {
    const items = [
      makeCartItem(2, 10, "pre-rolls"),
      makeCartItem(1, 8, "pre-rolls"),
    ];
    const discounts = calculateCartDeals(items);
    expect(discounts).toHaveLength(1);
    // total qty = 3, freeItems = 1, lowest price = 8
    expect(discounts[0].freeItems).toBe(1);
    expect(discounts[0].savings).toBe(8);
  });

  it("uses the lowest price for savings when items have mixed prices", () => {
    const items = [
      makeCartItem(2, 15, "pre-rolls"),
      makeCartItem(1, 5, "pre-rolls"),
    ];
    const discounts = calculateCartDeals(items);
    expect(discounts[0].savings).toBe(5);
  });

  it("returns empty array when products have no category", () => {
    const items = [{ quantity: 5, product: { price: 10, category: null } }];
    expect(calculateCartDeals(items)).toEqual([]);
  });

  it("handles mix of matching and non-matching items", () => {
    const items = [
      makeCartItem(3, 10, "pre-rolls"),
      makeCartItem(5, 20, "edibles"),
      makeCartItem(2, 15, "flower"),
    ];
    const discounts = calculateCartDeals(items);
    // Only pre-rolls match: 3 items = 1 free
    expect(discounts).toHaveLength(1);
    expect(discounts[0].freeItems).toBe(1);
    expect(discounts[0].savings).toBe(10);
  });

  it("returns empty array when price is 0 (no savings)", () => {
    const items = [makeCartItem(3, 0, "pre-rolls")];
    expect(calculateCartDeals(items)).toEqual([]);
  });
});
