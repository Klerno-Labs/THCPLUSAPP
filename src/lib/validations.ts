import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const customerSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const guestSessionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
});

// ─── Products ────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  nameEs: z.string().max(200).optional(),
  categoryId: z.string().min(1, "Category is required"),
  descriptionEn: z.string().max(2000).optional(),
  descriptionEs: z.string().max(2000).optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  thcPercentage: z.number().min(0).max(100).optional(),
  cbdPercentage: z.number().min(0).max(100).optional(),
  strainType: z.enum(["SATIVA", "INDICA", "HYBRID", "CBD"]).optional(),
  weight: z.string().max(50).optional(),
  imageUrl: z.string().url().optional(),
  inStock: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const categorySchema = z.object({
  nameEn: z.string().min(1).max(100),
  nameEs: z.string().max(100).optional(),
  slug: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().default(0),
});

// ─── Orders ──────────────────────────────────────────────

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item required"),
  customerId: z.string().optional(),
  guestName: z.string().min(2).max(100).optional(),
  guestPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  guestSessionId: z.string().optional(),
}).refine(
  (data) => data.customerId || (data.guestName && data.guestPhone),
  { message: "Either customerId or guestName+guestPhone is required" }
);

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "PICKED_UP",
    "CANCELLED",
    "EXPIRED",
  ]),
  staffNotes: z.string().max(500).optional(),
  cancelReason: z.string().max(500).optional(),
  estimatedReadyTime: z.string().datetime().optional(),
});

// ─── Reviews ─────────────────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(1000).optional(),
});

// ─── Promotions ──────────────────────────────────────────

export const promotionSchema = z.object({
  titleEn: z.string().min(1).max(200),
  titleEs: z.string().max(200).optional(),
  bodyEn: z.string().min(1).max(1000),
  bodyEs: z.string().max(1000).optional(),
  type: z.enum(["SMS", "IN_APP", "BOTH"]).default("BOTH"),
  targetAudience: z.string().optional(),
});

// ─── Referrals ──────────────────────────────────────────

export const applyReferralSchema = z.object({
  code: z
    .string()
    .min(1, "Referral code is required")
    .max(20, "Invalid referral code"),
});

export type ApplyReferralInput = z.infer<typeof applyReferralSchema>;

// ─── Profile ─────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  email: z.string().email().optional().or(z.literal("")),
  preferredLanguage: z.enum(["en", "es"]).optional(),
});

// ─── Chat ────────────────────────────────────────────────

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  customerId: z.string().optional(),
  sessionId: z.string().optional(),
  language: z.enum(["en", "es"]).default("en"),
});

// ─── Staff ───────────────────────────────────────────────

export const staffUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["OWNER", "MANAGER", "STAFF"]).default("STAFF"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Hero Banner ─────────────────────────────────────────

export const heroBannerSchema = z.object({
  titleEn: z.string().min(1).max(200),
  titleEs: z.string().max(200).optional(),
  bodyEn: z.string().max(500).optional(),
  bodyEs: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// ─── Deals ─────────────────────────────────────────────

export const dealSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  titleEn: z.string().min(1).max(200),
  titleEs: z.string().max(200).optional(),
  badgeText: z.string().max(50).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
}).refine(
  (data) => new Date(data.endsAt) > new Date(data.startsAt),
  { message: "End date must be after start date" }
);

export type DealInput = z.infer<typeof dealSchema>;

// ─── Stock Alerts ──────────────────────────────────────

export const stockAlertSchema = z.object({
  productId: z.string().min(1, "Product is required"),
});

export type StockAlertInput = z.infer<typeof stockAlertSchema>;

// ─── Redemptions ────────────────────────────────────────

export const redeemRewardSchema = z.object({
  rewardKey: z.string().min(1, "Reward key is required"),
});

export const fulfillRedemptionSchema = z.object({
  status: z.enum(["FULFILLED", "CANCELLED"]),
  staffNotes: z.string().max(500).optional(),
});

export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;
export type FulfillRedemptionInput = z.infer<typeof fulfillRedemptionSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerSignupInput = z.infer<typeof customerSignupSchema>;
export type GuestSessionInput = z.infer<typeof guestSessionSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type PromotionInput = z.infer<typeof promotionSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
