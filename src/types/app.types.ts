import type {
  Order,
  OrderItem,
  Product,
  Category,
  Profile,
  Review,
  OrderStatusHistory,
  GuestSession,
} from "@prisma/client";

// ─── Extended Types ──────────────────────────────────────

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
  customer?: Profile | null;
  guestSession?: GuestSession | null;
  statusHistory?: OrderStatusHistory[];
};

export type ProductWithCategory = Product & {
  category: Category;
  reviews?: Review[];
  _count?: {
    reviews: number;
    orderItems: number;
  };
  avgRating?: number;
};

export type CategoryWithProducts = Category & {
  products: Product[];
  _count?: {
    products: number;
  };
};

export type ProfileWithOrders = Profile & {
  orders: OrderWithItems[];
  _count?: {
    orders: number;
    reviews: number;
    favorites: number;
  };
};

// ─── Cart Types ──────────────────────────────────────────

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
}

// ─── AI Types ────────────────────────────────────────────

export interface AiUpsellSuggestion {
  productId: string;
  name: string;
  reason: string;
  price: number;
  imageUrl?: string;
}

export interface AiOrderScore {
  score: number;
  flags: string[];
  reason: string;
}

export interface AiInsight {
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "tip";
}

// ─── Chat Types ──────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// ─── Analytics Types ─────────────────────────────────────

export interface AnalyticsKPI {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

export interface TopProduct {
  productId: string;
  name: string;
  count: number;
}

export interface PeakHourData {
  hour: number;
  day: number;
  orders: number;
}

// ─── Pusher Event Types ──────────────────────────────────

export interface OrderCreatedEvent {
  orderId: string;
  orderNumber: string;
  customerName: string;
  totalItems: number;
  createdAt: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  orderNumber: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
}

export interface OrderAiScoredEvent {
  orderId: string;
  score: number;
  flags: string[];
}

// ─── Session Extension ───────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      phone?: string;
    };
  }

  interface User {
    role?: string;
    phone?: string;
  }
}

// JWT type is extended via the callbacks in lib/auth.ts
