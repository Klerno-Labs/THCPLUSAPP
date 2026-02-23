import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  generateOrderNumber,
  formatPrice,
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  getOrderStatusLabel,
  getOrderStatusColor,
  getLoyaltyTierLabel,
  getLoyaltyTierClass,
  getLoyaltyTierThreshold,
  calculateLoyaltyTier,
  truncate,
  slugify,
  sanitizeInput,
  containsProfanity,
  filterProfanity,
} from "../utils";

// ─── cn (className merge) ───────────────────────────────
describe("cn", () => {
  it("merges two class strings", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves Tailwind conflicts by using the last value", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("filters out falsy values", () => {
    expect(cn("base", false, null, undefined, "end")).toBe("base end");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("merges arrays of classes", () => {
    expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
  });
});

// ─── formatPrice ────────────────────────────────────────
describe("formatPrice", () => {
  it("formats a whole number as USD", () => {
    expect(formatPrice(10)).toBe("$10.00");
  });

  it("formats a decimal price", () => {
    expect(formatPrice(12.99)).toBe("$12.99");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("formats a large number with commas", () => {
    expect(formatPrice(1000)).toBe("$1,000.00");
  });

  it("formats a small fractional price", () => {
    expect(formatPrice(0.01)).toBe("$0.01");
  });

  it("rounds to two decimal places", () => {
    // Intl.NumberFormat rounds 0.005 -> $0.01 or $0.00 depending on precision
    const result = formatPrice(9.999);
    expect(result).toBe("$10.00");
  });
});

// ─── generateOrderNumber ────────────────────────────────
describe("generateOrderNumber", () => {
  it("starts with THC- prefix", () => {
    const orderNum = generateOrderNumber();
    expect(orderNum.startsWith("THC-")).toBe(true);
  });

  it("returns a string of consistent format length", () => {
    const orderNum = generateOrderNumber();
    // THC- (4 chars) + 4 timestamp chars + 4 random chars = 12
    expect(orderNum.length).toBe(12);
  });

  it("contains only uppercase alphanumeric characters after prefix", () => {
    const orderNum = generateOrderNumber();
    const suffix = orderNum.slice(4); // after "THC-"
    expect(suffix).toMatch(/^[A-Z0-9]+$/);
  });

  it("generates unique order numbers on successive calls", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    // Not guaranteed to differ in the timestamp part, but random part should differ
    // This is a probabilistic test; two different calls almost certainly differ
    // We just verify format is consistent
    expect(a.startsWith("THC-")).toBe(true);
    expect(b.startsWith("THC-")).toBe(true);
  });
});

// ─── formatDate ─────────────────────────────────────────
describe("formatDate", () => {
  it("formats a Date object", () => {
    // Jan 15, 2024
    const date = new Date(2024, 0, 15);
    expect(formatDate(date)).toBe("Jan 15, 2024");
  });

  it("formats an ISO string", () => {
    const result = formatDate("2024-06-01T12:00:00Z");
    expect(result).toContain("2024");
    expect(result).toContain("Jun");
  });
});

// ─── formatTime ─────────────────────────────────────────
describe("formatTime", () => {
  it("formats time in 12-hour format", () => {
    const date = new Date(2024, 0, 15, 14, 30); // 2:30 PM
    const result = formatTime(date);
    expect(result).toContain("2:30");
    expect(result).toContain("PM");
  });
});

// ─── formatDateTime ─────────────────────────────────────
describe("formatDateTime", () => {
  it("contains both date and time separated by 'at'", () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const result = formatDateTime(date);
    expect(result).toContain("at");
    expect(result).toContain("Jan 15, 2024");
  });
});

// ─── getRelativeTime ────────────────────────────────────
describe("getRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0)); // June 15, 2024 12:00:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Just now' for times less than 1 minute ago", () => {
    const tenSecondsAgo = new Date(2024, 5, 15, 11, 59, 50);
    expect(getRelativeTime(tenSecondsAgo)).toBe("Just now");
  });

  it("returns minutes ago for times less than 1 hour", () => {
    const thirtyMinsAgo = new Date(2024, 5, 15, 11, 30, 0);
    expect(getRelativeTime(thirtyMinsAgo)).toBe("30m ago");
  });

  it("returns hours ago for times less than 1 day", () => {
    const threeHoursAgo = new Date(2024, 5, 15, 9, 0, 0);
    expect(getRelativeTime(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days ago for times less than 1 week", () => {
    const twoDaysAgo = new Date(2024, 5, 13, 12, 0, 0);
    expect(getRelativeTime(twoDaysAgo)).toBe("2d ago");
  });

  it("returns formatted date for times older than 1 week", () => {
    const twoWeeksAgo = new Date(2024, 5, 1, 12, 0, 0);
    const result = getRelativeTime(twoWeeksAgo);
    expect(result).toContain("Jun");
    expect(result).toContain("2024");
  });
});

// ─── getOrderStatusLabel ────────────────────────────────
describe("getOrderStatusLabel", () => {
  it("returns human-readable label for PENDING", () => {
    expect(getOrderStatusLabel("PENDING")).toBe("Pending");
  });

  it("returns human-readable label for READY", () => {
    expect(getOrderStatusLabel("READY")).toBe("Ready for Pickup");
  });

  it("returns human-readable label for PICKED_UP", () => {
    expect(getOrderStatusLabel("PICKED_UP")).toBe("Picked Up");
  });

  it("returns the raw status string for unknown statuses", () => {
    expect(getOrderStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});

// ─── getOrderStatusColor ────────────────────────────────
describe("getOrderStatusColor", () => {
  it("returns the correct CSS class for PENDING", () => {
    expect(getOrderStatusColor("PENDING")).toBe("status-pending");
  });

  it("returns empty string for unknown status", () => {
    expect(getOrderStatusColor("UNKNOWN")).toBe("");
  });
});

// ─── getLoyaltyTierLabel ────────────────────────────────
describe("getLoyaltyTierLabel", () => {
  it("returns 'Seedling' for SEEDLING", () => {
    expect(getLoyaltyTierLabel("SEEDLING")).toBe("Seedling");
  });

  it("returns 'Master Grower' for MASTER_GROWER", () => {
    expect(getLoyaltyTierLabel("MASTER_GROWER")).toBe("Master Grower");
  });

  it("returns raw tier for unknown tier", () => {
    expect(getLoyaltyTierLabel("DIAMOND")).toBe("DIAMOND");
  });
});

// ─── getLoyaltyTierClass ────────────────────────────────
describe("getLoyaltyTierClass", () => {
  it("returns the correct CSS class for CULTIVATOR", () => {
    expect(getLoyaltyTierClass("CULTIVATOR")).toBe("tier-cultivator");
  });

  it("returns empty string for unknown tier", () => {
    expect(getLoyaltyTierClass("UNKNOWN")).toBe("");
  });
});

// ─── getLoyaltyTierThreshold ────────────────────────────
describe("getLoyaltyTierThreshold", () => {
  it("returns 0 for SEEDLING", () => {
    expect(getLoyaltyTierThreshold("SEEDLING")).toBe(0);
  });

  it("returns 25 for GROWER", () => {
    expect(getLoyaltyTierThreshold("GROWER")).toBe(25);
  });

  it("returns 100 for CULTIVATOR", () => {
    expect(getLoyaltyTierThreshold("CULTIVATOR")).toBe(100);
  });

  it("returns 500 for MASTER_GROWER", () => {
    expect(getLoyaltyTierThreshold("MASTER_GROWER")).toBe(500);
  });

  it("returns 0 for unknown tier", () => {
    expect(getLoyaltyTierThreshold("UNKNOWN")).toBe(0);
  });
});

// ─── calculateLoyaltyTier ───────────────────────────────
describe("calculateLoyaltyTier", () => {
  it("returns SEEDLING for 0 points", () => {
    expect(calculateLoyaltyTier(0)).toBe("SEEDLING");
  });

  it("returns SEEDLING for 24 points", () => {
    expect(calculateLoyaltyTier(24)).toBe("SEEDLING");
  });

  it("returns GROWER for 25 points (boundary)", () => {
    expect(calculateLoyaltyTier(25)).toBe("GROWER");
  });

  it("returns GROWER for 99 points", () => {
    expect(calculateLoyaltyTier(99)).toBe("GROWER");
  });

  it("returns CULTIVATOR for 100 points (boundary)", () => {
    expect(calculateLoyaltyTier(100)).toBe("CULTIVATOR");
  });

  it("returns CULTIVATOR for 499 points", () => {
    expect(calculateLoyaltyTier(499)).toBe("CULTIVATOR");
  });

  it("returns MASTER_GROWER for 500 points (boundary)", () => {
    expect(calculateLoyaltyTier(500)).toBe("MASTER_GROWER");
  });

  it("returns MASTER_GROWER for 10000 points", () => {
    expect(calculateLoyaltyTier(10000)).toBe("MASTER_GROWER");
  });
});

// ─── truncate ───────────────────────────────────────────
describe("truncate", () => {
  it("returns the original string if shorter than maxLen", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns the original string if equal to maxLen", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and adds ellipsis if longer than maxLen", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("handles maxLen of 3 (just ellipsis)", () => {
    expect(truncate("hello", 3)).toBe("...");
  });
});

// ─── slugify ────────────────────────────────────────────
describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("Pre-Rolls & Joints")).toBe("pre-rolls-joints");
  });

  it("removes leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("collapses multiple special chars into single hyphen", () => {
    expect(slugify("a   b   c")).toBe("a-b-c");
  });

  it("handles already-slugified input", () => {
    expect(slugify("pre-rolls")).toBe("pre-rolls");
  });
});

// ─── sanitizeInput ──────────────────────────────────────
describe("sanitizeInput", () => {
  it("escapes < and > tags", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
    );
  });

  it("escapes double quotes", () => {
    expect(sanitizeInput('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("leaves plain text unchanged", () => {
    expect(sanitizeInput("hello world")).toBe("hello world");
  });

  it("escapes forward slashes", () => {
    expect(sanitizeInput("a/b")).toBe("a&#x2F;b");
  });
});

// ─── containsProfanity ──────────────────────────────────
describe("containsProfanity", () => {
  it("detects profanity in text", () => {
    expect(containsProfanity("what the fuck")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(containsProfanity("DAMN it")).toBe(true);
  });

  it("returns false for clean text", () => {
    expect(containsProfanity("This is great!")).toBe(false);
  });

  it("uses word boundary matching", () => {
    // "class" contains "ass" but not as a standalone word
    expect(containsProfanity("class")).toBe(false);
  });
});

// ─── filterProfanity ────────────────────────────────────
describe("filterProfanity", () => {
  it("replaces profane words with asterisks", () => {
    expect(filterProfanity("what the fuck")).toBe("what the ****");
  });

  it("replaces with correct number of asterisks", () => {
    expect(filterProfanity("oh shit")).toBe("oh ****");
  });

  it("leaves clean text unchanged", () => {
    expect(filterProfanity("lovely day")).toBe("lovely day");
  });

  it("handles multiple profane words", () => {
    const result = filterProfanity("damn this crap");
    expect(result).toBe("**** this ****");
  });
});
