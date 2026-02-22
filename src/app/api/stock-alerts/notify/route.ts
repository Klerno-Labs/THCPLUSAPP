import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── POST: Internal — mark alerts as notified for a product ─
// Called by admin/staff when restocking a product
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["OWNER", "MANAGER", "STAFF"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Find all un-notified alerts for this product
    const alerts = await prisma.stockAlert.findMany({
      where: {
        productId,
        notified: false,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (alerts.length === 0) {
      return NextResponse.json({
        message: "No pending alerts for this product",
        count: 0,
      });
    }

    // Mark all alerts as notified
    const result = await prisma.stockAlert.updateMany({
      where: {
        productId,
        notified: false,
      },
      data: {
        notified: true,
      },
    });

    // In production, this is where you would send notifications via
    // Pusher, SMS (Twilio), or push notifications. For now, we just
    // mark them as notified.

    return NextResponse.json({
      message: `Notified ${result.count} customer(s)`,
      count: result.count,
      customers: alerts.map((a) => ({
        id: a.customer.id,
        name: a.customer.name,
        phone: a.customer.phone,
      })),
    });
  } catch (error) {
    console.error("[POST /api/stock-alerts/notify]", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }
}
