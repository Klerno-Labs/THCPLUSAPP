"use client";

import { useEffect, useRef } from "react";
import type { Channel } from "pusher-js";
import { getPusherClient } from "@/lib/pusher";

export function usePusherChannel(
  channelName: string,
  eventName: string,
  callback: (data: any) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel: Channel = pusher.subscribe(channelName);

    const handler = (data: any) => {
      callbackRef.current(data);
    };

    channel.bind(eventName, handler);

    return () => {
      channel.unbind(eventName, handler);
      pusher.unsubscribe(channelName);
    };
  }, [channelName, eventName]);
}
