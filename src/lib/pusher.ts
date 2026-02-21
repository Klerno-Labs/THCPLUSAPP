import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (lazy to avoid build-time errors)
let _pusherServer: Pusher | null = null;
export function getPusherServer(): Pusher {
  if (!_pusherServer) {
    _pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return _pusherServer;
}

/** @deprecated Use getPusherServer() */
export const pusherServer = new Proxy({} as Pusher, {
  get(_, prop) {
    return (getPusherServer() as any)[prop];
  },
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
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
