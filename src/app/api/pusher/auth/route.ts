import { NextRequest, NextResponse } from "next/server";
import { getPusherServer } from "@/lib/pusher";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ─── POST: Authenticate Pusher Private Channels ────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const socketId = formData.get("socket_id") as string;
    const channelName = formData.get("channel_name") as string;

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: "socket_id and channel_name are required" },
        { status: 400 }
      );
    }

    // ── Handle admin channels ──
    if (channelName.startsWith("private-admin-")) {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 403 }
        );
      }

      const role = (session.user as any).role;
      if (!["OWNER", "MANAGER", "STAFF"].includes(role)) {
        return NextResponse.json(
          { error: "Staff access required" },
          { status: 403 }
        );
      }

      const pusher = getPusherServer();
      if (!pusher) {
        return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
      }
      const authResponse = pusher.authorizeChannel(
        socketId,
        channelName
      );

      return NextResponse.json(authResponse);
    }

    // ── Handle order-specific channels ──
    if (channelName.startsWith("private-order-")) {
      const orderId = channelName.replace("private-order-", "");

      if (!orderId) {
        return NextResponse.json(
          { error: "Invalid channel name" },
          { status: 400 }
        );
      }

      // Check if the order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          customerId: true,
          guestSessionId: true,
          guestPhone: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Allow staff to subscribe to any order channel
      const session = await auth();
      if (session?.user) {
        const role = (session.user as any).role;
        if (["OWNER", "MANAGER", "STAFF"].includes(role)) {
          const pusher = getPusherServer();
          if (!pusher) {
            return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
          }
          const authResponse = pusher.authorizeChannel(socketId, channelName);
          return NextResponse.json(authResponse);
        }

        // Customer can subscribe to their own order
        if (order.customerId && order.customerId === session.user.id) {
          const pusher = getPusherServer();
          if (!pusher) {
            return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
          }
          const authResponse = pusher.authorizeChannel(socketId, channelName);
          return NextResponse.json(authResponse);
        }
      }

      // Guest users: check via guest session token from header
      const guestSessionToken = request.headers.get("x-guest-session-token");
      if (guestSessionToken && order.guestSessionId) {
        const guestSession = await prisma.guestSession.findUnique({
          where: { sessionToken: guestSessionToken },
        });

        if (
          guestSession &&
          guestSession.id === order.guestSessionId &&
          guestSession.expiresAt > new Date()
        ) {
          const pusher = getPusherServer();
          if (!pusher) {
            return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
          }
          const authResponse = pusher.authorizeChannel(socketId, channelName);
          return NextResponse.json(authResponse);
        }
      }

      return NextResponse.json(
        { error: "Not authorized to access this order channel" },
        { status: 403 }
      );
    }

    // ── Unknown channel pattern ──
    return NextResponse.json(
      { error: "Unknown channel pattern" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/pusher/auth error:", error);
    return NextResponse.json(
      { error: "Pusher authentication failed" },
      { status: 500 }
    );
  }
}
