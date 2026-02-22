import type { LoyaltyTier } from "@prisma/client";

export interface Reward {
  key: string;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  pointsCost: number;
  minTier: LoyaltyTier;
  icon: string;
  expirationDays: number;
}

export const REWARDS: Reward[] = [
  {
    key: "FREE_PREROLL",
    label: "Free Preroll",
    labelEs: "Preroll Gratis",
    description: "Redeem for one free preroll of your choice",
    descriptionEs: "Canjea por un preroll gratis",
    pointsCost: 25,
    minTier: "SEEDLING",
    icon: "🚬",
    expirationDays: 7,
  },
  {
    key: "FREE_EDIBLE",
    label: "Free Edible",
    labelEs: "Comestible Gratis",
    description: "Redeem for one free edible of your choice",
    descriptionEs: "Canjea por un comestible gratis",
    pointsCost: 50,
    minTier: "SEEDLING",
    icon: "🍬",
    expirationDays: 7,
  },
  {
    key: "FREE_1G_CONCENTRATE",
    label: "Free 1g Concentrate",
    labelEs: "Concentrado 1g Gratis",
    description: "Redeem for one free gram of concentrate",
    descriptionEs: "Canjea por un gramo de concentrado gratis",
    pointsCost: 75,
    minTier: "GROWER",
    icon: "💎",
    expirationDays: 7,
  },
  {
    key: "FREE_EIGHTH_FLOWER",
    label: "Free 1/8 Flower",
    labelEs: "1/8 de Flor Gratis",
    description: "Redeem for a free eighth of flower",
    descriptionEs: "Canjea por un octavo de flor gratis",
    pointsCost: 150,
    minTier: "CULTIVATOR",
    icon: "🌿",
    expirationDays: 7,
  },
];

const TIER_ORDER: Record<LoyaltyTier, number> = {
  SEEDLING: 0,
  GROWER: 1,
  CULTIVATOR: 2,
  MASTER_GROWER: 3,
};

export function meetsMinTier(
  customerTier: LoyaltyTier,
  requiredTier: LoyaltyTier
): boolean {
  return TIER_ORDER[customerTier] >= TIER_ORDER[requiredTier];
}

export function getAvailableRewards(
  points: number,
  tier: LoyaltyTier
): Reward[] {
  return REWARDS.filter(
    (r) => points >= r.pointsCost && meetsMinTier(tier, r.minTier)
  );
}

export function getRewardByKey(key: string): Reward | undefined {
  return REWARDS.find((r) => r.key === key);
}
