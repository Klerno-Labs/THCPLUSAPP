import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (lazy, null-safe when env vars missing)
let _pusherServer: Pusher | null = null;
export function getPusherServer(): Pusher | null {
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET ||
    !process.env.PUSHER_CLUSTER
  ) {
    return null;
  }
  if (!_pusherServer) {
    _pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
  }
  return _pusherServer;
}

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (
    !process.env.NEXT_PUBLIC_PUSHER_KEY ||
    !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  ) {
    return null;
  }
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: "/api/pusher/auth",
      }
    );
  }
  return pusherClientInstance;
}

// Channel names
export const CHANNELS = {
  adminOrders: "private-admin-orders",
  adminAlerts: "private-admin-alerts",
  order: (orderId: string) => `private-order-${orderId}`,
} as const;

// Event names
export const EVENTS = {
  orderCreated: "order.created",
  orderStatusChanged: "order.status_changed",
  orderAiScored: "order.ai_scored",
  inventoryUpdated: "inventory.updated",
} as const;
