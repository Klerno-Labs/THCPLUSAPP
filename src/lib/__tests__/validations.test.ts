import { describe, it, expect } from "vitest";
import {
  loginSchema,
  customerSignupSchema,
  createOrderSchema,
  orderItemSchema,
  reviewSchema,
  productSchema,
  guestSessionSchema,
  updateOrderStatusSchema,
  staffUserSchema,
} from "../validations";

// ─── loginSchema ────────────────────────────────────────
describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty email string", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a password exactly 6 characters long", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email field", () => {
    const result = loginSchema.safeParse({ password: "abc123" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password field", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });
});

// ─── customerSignupSchema ───────────────────────────────
describe("customerSignupSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = customerSignupSchema.safeParse({
      name: "John",
      phone: "+12025551234",
      email: "john@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input without email (optional)", () => {
    const result = customerSignupSchema.safeParse({
      name: "Jane",
      phone: "12025551234",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string for email", () => {
    const result = customerSignupSchema.safeParse({
      name: "Jane",
      phone: "12025551234",
      email: "",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number that is too short", () => {
    const result = customerSignupSchema.safeParse({
      name: "Jane",
      phone: "123",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number starting with 0", () => {
    const result = customerSignupSchema.safeParse({
      name: "Jane",
      phone: "0123456789",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = customerSignupSchema.safeParse({
      name: "J",
      phone: "+12025551234",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    const result = customerSignupSchema.safeParse({
      name: "A".repeat(101),
      phone: "+12025551234",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a phone number with the + prefix", () => {
    const result = customerSignupSchema.safeParse({
      name: "Tom",
      phone: "+447911123456",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number with letters", () => {
    const result = customerSignupSchema.safeParse({
      name: "Tom",
      phone: "+1abc5551234",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });
});

// ─── orderItemSchema ────────────────────────────────────
describe("orderItemSchema", () => {
  it("accepts valid productId and quantity", () => {
    const result = orderItemSchema.safeParse({
      productId: "product-123",
      quantity: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects quantity of 0 (must be positive)", () => {
    const result = orderItemSchema.safeParse({
      productId: "product-123",
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = orderItemSchema.safeParse({
      productId: "product-123",
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects quantity exceeding 100", () => {
    const result = orderItemSchema.safeParse({
      productId: "product-123",
      quantity: 101,
    });
    expect(result.success).toBe(false);
  });

  it("accepts quantity of exactly 100", () => {
    const result = orderItemSchema.safeParse({
      productId: "product-123",
      quantity: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty productId", () => {
    const result = orderItemSchema.safeParse({
      productId: "",
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer quantity", () => {
    const result = orderItemSchema.safeParse({
      productId: "product-123",
      quantity: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

// ─── createOrderSchema ──────────────────────────────────
describe("createOrderSchema", () => {
  it("accepts a valid order with customerId", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: "p1", quantity: 1 }],
      customerId: "cust-123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid order with guest info", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: "p1", quantity: 1 }],
      guestName: "John",
      guestPhone: "+12025551234",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an order with empty items array", () => {
    const result = createOrderSchema.safeParse({
      items: [],
      customerId: "cust-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an order with more than 50 items", () => {
    const items = Array.from({ length: 51 }, (_, i) => ({
      productId: `p${i}`,
      quantity: 1,
    }));
    const result = createOrderSchema.safeParse({
      items,
      customerId: "cust-123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 50 items", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      productId: `p${i}`,
      quantity: 1,
    }));
    const result = createOrderSchema.safeParse({
      items,
      customerId: "cust-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when neither customerId nor guestName+guestPhone is provided", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: "p1", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects when guestName is provided without guestPhone", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: "p1", quantity: 1 }],
      guestName: "John",
    });
    expect(result.success).toBe(false);
  });
});

// ─── reviewSchema ───────────────────────────────────────
describe("reviewSchema", () => {
  it("accepts a valid review with rating 5", () => {
    const result = reviewSchema.safeParse({
      productId: "p1",
      rating: 5,
      body: "Great product!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid review with rating 1", () => {
    const result = reviewSchema.safeParse({
      productId: "p1",
      rating: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating 0 (below minimum)", () => {
    const result = reviewSchema.safeParse({
      productId: "p1",
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating 6 (above maximum)", () => {
    const result = reviewSchema.safeParse({
      productId: "p1",
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative rating", () => {
    const result = reviewSchema.safeParse({
      productId: "p1",
      rating: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    const result = reviewSchema.safeParse({
      productId: "p1",
      rating: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a review without body (optional)", () => {
    const result = reviewSchema.safeParse({
      productId: "p1",
      rating: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects body longer than 1000 characters", () => {
    const result = reviewSchema.safeParse({
      productId: "p1",
      rating: 3,
      body: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty productId", () => {
    const result = reviewSchema.safeParse({
      productId: "",
      rating: 3,
    });
    expect(result.success).toBe(false);
  });
});

// ─── productSchema ──────────────────────────────────────
describe("productSchema", () => {
  const validProduct = {
    name: "OG Kush Pre-Roll",
    categoryId: "cat-1",
    price: 12.99,
  };

  it("accepts a minimal valid product", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("sets defaults for inStock, quantity, isFeatured, sortOrder", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inStock).toBe(true);
      expect(result.data.quantity).toBe(0);
      expect(result.data.isFeatured).toBe(false);
      expect(result.data.sortOrder).toBe(0);
    }
  });

  it("rejects price of 0", () => {
    const result = productSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts a price of 0.01 (minimum)", () => {
    const result = productSchema.safeParse({ ...validProduct, price: 0.01 });
    expect(result.success).toBe(true);
  });

  it("rejects THC percentage over 100", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      thcPercentage: 101,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative THC percentage", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      thcPercentage: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid THC and CBD percentages", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      thcPercentage: 25.5,
      cbdPercentage: 0.3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects CBD percentage over 100", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      cbdPercentage: 150,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty categoryId", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      categoryId: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid strainType values", () => {
    for (const strain of ["SATIVA", "INDICA", "HYBRID", "CBD"]) {
      const result = productSchema.safeParse({
        ...validProduct,
        strainType: strain,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid strainType value", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      strainType: "RUDERALIS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 200 characters", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      name: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid imageUrl", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      imageUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid imageUrl", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      imageUrl: "https://example.com/image.jpg",
    });
    expect(result.success).toBe(true);
  });
});

// ─── guestSessionSchema ─────────────────────────────────
describe("guestSessionSchema", () => {
  it("accepts valid name and phone", () => {
    const result = guestSessionSchema.safeParse({
      name: "Jane Doe",
      phone: "+12025551234",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = guestSessionSchema.safeParse({
      name: "J",
      phone: "+12025551234",
    });
    expect(result.success).toBe(false);
  });
});

// ─── updateOrderStatusSchema ────────────────────────────
describe("updateOrderStatusSchema", () => {
  it("accepts all valid status values", () => {
    const statuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "PICKED_UP",
      "CANCELLED",
      "EXPIRED",
    ];
    for (const status of statuses) {
      const result = updateOrderStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid status value", () => {
    const result = updateOrderStatusSchema.safeParse({
      status: "SHIPPED",
    });
    expect(result.success).toBe(false);
  });
});

// ─── staffUserSchema ────────────────────────────────────
describe("staffUserSchema", () => {
  it("requires a password of at least 8 characters", () => {
    const result = staffUserSchema.safeParse({
      name: "Admin",
      email: "admin@shop.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid staff user", () => {
    const result = staffUserSchema.safeParse({
      name: "Admin",
      email: "admin@shop.com",
      password: "longpassword",
    });
    expect(result.success).toBe(true);
  });
});
