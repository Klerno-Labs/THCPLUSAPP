import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

// GET: Return items for a specific order (auth required, own orders only)
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = params;

    // Fetch order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        orderNumber: true,
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            unitPriceAtOrder: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                inStock: true,
                imageUrl: true,
                weight: true,
                categoryId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow fetching own orders
    if (order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const items = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      productName: item.product.name,
      price: item.product.price,
      priceAtOrder: item.unitPriceAtOrder,
      inStock: item.product.inStock,
      imageUrl: item.product.imageUrl,
      product: item.product,
    }));

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items,
    });
  } catch (error) {
    console.error(`GET /api/orders/${params.id}/items error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch order items" },
      { status: 500 }
    );
  }
}
