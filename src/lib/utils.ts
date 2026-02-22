import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOrderNumber(): string {
  const prefix = "THC";
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY: "Ready for Pickup",
    PICKED_UP: "Picked Up",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "status-pending",
    CONFIRMED: "status-confirmed",
    PREPARING: "status-preparing",
    READY: "status-ready",
    PICKED_UP: "status-picked-up",
    CANCELLED: "status-cancelled",
    EXPIRED: "status-expired",
  };
  return colors[status] || "";
}

export function getLoyaltyTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    SEEDLING: "Seedling",
    GROWER: "Grower",
    CULTIVATOR: "Cultivator",
    MASTER_GROWER: "Master Grower",
  };
  return labels[tier] || tier;
}

export function getLoyaltyTierClass(tier: string): string {
  const classes: Record<string, string> = {
    SEEDLING: "tier-seedling",
    GROWER: "tier-grower",
    CULTIVATOR: "tier-cultivator",
    MASTER_GROWER: "tier-master-grower",
  };
  return classes[tier] || "";
}

export function getLoyaltyTierThreshold(tier: string): number {
  const thresholds: Record<string, number> = {
    SEEDLING: 0,
    GROWER: 25,
    CULTIVATOR: 100,
    MASTER_GROWER: 500,
  };
  return thresholds[tier] || 0;
}

export function calculateLoyaltyTier(points: number): string {
  if (points >= 500) return "MASTER_GROWER";
  if (points >= 100) return "CULTIVATOR";
  if (points >= 25) return "GROWER";
  return "SEEDLING";
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export const PROFANITY_LIST = [
  // Minimal list — extend as needed
  "fuck", "shit", "ass", "damn", "bitch", "bastard", "dick", "crap",
];

export function containsProfanity(text: string): boolean {
  return PROFANITY_LIST.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(text));
}

export function filterProfanity(text: string): string {
  let filtered = text;
  PROFANITY_LIST.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  return filtered;
}
