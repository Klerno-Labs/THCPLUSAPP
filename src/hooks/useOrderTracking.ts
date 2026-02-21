"use client";

import { useState, useEffect, useCallback } from "react";
import { usePusherChannel } from "./usePusherChannel";
import { CHANNELS, EVENTS } from "@/lib/pusher";
import type { OrderWithItems, OrderStatusChangedEvent } from "@/types/app.types";

export function useOrderTracking(orderId: string) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  usePusherChannel(
    CHANNELS.order(orderId),
    EVENTS.orderStatusChanged,
    (data: OrderStatusChangedEvent) => {
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: data.newStatus as any,
              updatedAt: new Date(data.updatedAt),
            }
          : null
      );
    }
  );

  return { order, isLoading, refetch: fetchOrder };
}
