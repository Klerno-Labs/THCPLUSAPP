import { describe, it, expect } from "vitest";
import {
  meetsMinTier,
  getAvailableRewards,
  getRewardByKey,
  REWARDS,
} from "../rewards";

// The LoyaltyTier type from Prisma is a string union. We use the
// actual string values directly, which is compatible with the
// runtime behaviour of the functions.
type Tier = "SEEDLING" | "GROWER" | "CULTIVATOR" | "MASTER_GROWER";

// ─── REWARDS constant ───────────────────────────────────
describe("REWARDS", () => {
  it("contains 4 reward definitions", () => {
    expect(REWARDS).toHaveLength(4);
  });

  it("each reward has a unique key", () => {
    const keys = REWARDS.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every reward has positive pointsCost", () => {
    REWARDS.forEach((r) => {
      expect(r.pointsCost).toBeGreaterThan(0);
    });
  });

  it("every reward has a 7-day expiration", () => {
    REWARDS.forEach((r) => {
      expect(r.expirationDays).toBe(7);
    });
  });
});

// ─── meetsMinTier ───────────────────────────────────────
describe("meetsMinTier", () => {
  it("SEEDLING meets SEEDLING requirement", () => {
    expect(meetsMinTier("SEEDLING" as Tier, "SEEDLING" as Tier)).toBe(true);
  });

  it("MASTER_GROWER meets any tier requirement", () => {
    const tiers: Tier[] = ["SEEDLING", "GROWER", "CULTIVATOR", "MASTER_GROWER"];
    tiers.forEach((tier) => {
      expect(meetsMinTier("MASTER_GROWER" as Tier, tier as Tier)).toBe(true);
    });
  });

  it("SEEDLING does NOT meet GROWER requirement", () => {
    expect(meetsMinTier("SEEDLING" as Tier, "GROWER" as Tier)).toBe(false);
  });

  it("SEEDLING does NOT meet CULTIVATOR requirement", () => {
    expect(meetsMinTier("SEEDLING" as Tier, "CULTIVATOR" as Tier)).toBe(false);
  });

  it("GROWER meets GROWER requirement", () => {
    expect(meetsMinTier("GROWER" as Tier, "GROWER" as Tier)).toBe(true);
  });

  it("GROWER meets SEEDLING requirement", () => {
    expect(meetsMinTier("GROWER" as Tier, "SEEDLING" as Tier)).toBe(true);
  });

  it("CULTIVATOR does NOT meet MASTER_GROWER requirement", () => {
    expect(meetsMinTier("CULTIVATOR" as Tier, "MASTER_GROWER" as Tier)).toBe(
      false
    );
  });

  it("CULTIVATOR meets CULTIVATOR requirement", () => {
    expect(meetsMinTier("CULTIVATOR" as Tier, "CULTIVATOR" as Tier)).toBe(true);
  });
});

// ─── getAvailableRewards ────────────────────────────────
describe("getAvailableRewards", () => {
  it("returns empty array when user has 0 points", () => {
    const rewards = getAvailableRewards(0, "SEEDLING" as Tier);
    expect(rewards).toEqual([]);
  });

  it("returns FREE_PREROLL for SEEDLING with 25 points", () => {
    const rewards = getAvailableRewards(25, "SEEDLING" as Tier);
    expect(rewards.map((r) => r.key)).toContain("FREE_PREROLL");
  });

  it("returns FREE_PREROLL and FREE_EDIBLE for SEEDLING with 50 points", () => {
    const rewards = getAvailableRewards(50, "SEEDLING" as Tier);
    const keys = rewards.map((r) => r.key);
    expect(keys).toContain("FREE_PREROLL");
    expect(keys).toContain("FREE_EDIBLE");
  });

  it("does NOT return FREE_1G_CONCENTRATE for SEEDLING even with enough points", () => {
    // FREE_1G_CONCENTRATE requires GROWER tier
    const rewards = getAvailableRewards(1000, "SEEDLING" as Tier);
    const keys = rewards.map((r) => r.key);
    expect(keys).not.toContain("FREE_1G_CONCENTRATE");
  });

  it("returns FREE_1G_CONCENTRATE for GROWER with 75 points", () => {
    const rewards = getAvailableRewards(75, "GROWER" as Tier);
    const keys = rewards.map((r) => r.key);
    expect(keys).toContain("FREE_1G_CONCENTRATE");
  });

  it("does NOT return FREE_EIGHTH_FLOWER for GROWER even with enough points", () => {
    // FREE_EIGHTH_FLOWER requires CULTIVATOR tier
    const rewards = getAvailableRewards(1000, "GROWER" as Tier);
    const keys = rewards.map((r) => r.key);
    expect(keys).not.toContain("FREE_EIGHTH_FLOWER");
  });

  it("returns all rewards for MASTER_GROWER with 500 points", () => {
    const rewards = getAvailableRewards(500, "MASTER_GROWER" as Tier);
    expect(rewards).toHaveLength(4);
  });

  it("does NOT return rewards when points are just below threshold", () => {
    const rewards = getAvailableRewards(24, "MASTER_GROWER" as Tier);
    expect(rewards).toEqual([]);
  });

  it("returns only SEEDLING-tier rewards for SEEDLING with max points", () => {
    const rewards = getAvailableRewards(9999, "SEEDLING" as Tier);
    // Should only get FREE_PREROLL and FREE_EDIBLE (both minTier: SEEDLING)
    rewards.forEach((r) => {
      expect(r.minTier).toBe("SEEDLING");
    });
  });
});

// ─── getRewardByKey ─────────────────────────────────────
describe("getRewardByKey", () => {
  it("returns the correct reward for FREE_PREROLL", () => {
    const reward = getRewardByKey("FREE_PREROLL");
    expect(reward).toBeDefined();
    expect(reward!.label).toBe("Free Preroll");
    expect(reward!.pointsCost).toBe(25);
  });

  it("returns the correct reward for FREE_EDIBLE", () => {
    const reward = getRewardByKey("FREE_EDIBLE");
    expect(reward).toBeDefined();
    expect(reward!.pointsCost).toBe(50);
  });

  it("returns the correct reward for FREE_1G_CONCENTRATE", () => {
    const reward = getRewardByKey("FREE_1G_CONCENTRATE");
    expect(reward).toBeDefined();
    expect(reward!.pointsCost).toBe(75);
    expect(reward!.minTier).toBe("GROWER");
  });

  it("returns the correct reward for FREE_EIGHTH_FLOWER", () => {
    const reward = getRewardByKey("FREE_EIGHTH_FLOWER");
    expect(reward).toBeDefined();
    expect(reward!.pointsCost).toBe(150);
    expect(reward!.minTier).toBe("CULTIVATOR");
  });

  it("returns undefined for an unknown key", () => {
    expect(getRewardByKey("NONEXISTENT")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getRewardByKey("")).toBeUndefined();
  });

  it("rewards have both English and Spanish labels", () => {
    REWARDS.forEach((r) => {
      const found = getRewardByKey(r.key);
      expect(found!.label.length).toBeGreaterThan(0);
      expect(found!.labelEs.length).toBeGreaterThan(0);
      expect(found!.description.length).toBeGreaterThan(0);
      expect(found!.descriptionEs.length).toBeGreaterThan(0);
    });
  });
});
