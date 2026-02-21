import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── PATCH: Update Customer (staffNotes, loyalty) ───────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { staffNotes, loyaltyAdjustment, loyaltyReason } = body;

    const customer = await prisma.profile.findUnique({
      where: { id: params.id },
    });
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Update staff notes
    if (staffNotes !== undefined) {
      await prisma.profile.update({
        where: { id: params.id },
        data: { staffNotes },
      });
    }

    // Adjust loyalty points
    if (loyaltyAdjustment && typeof loyaltyAdjustment === "number") {
      const newPoints = Math.max(0, customer.loyaltyPoints + loyaltyAdjustment);

      await prisma.$transaction([
        prisma.profile.update({
          where: { id: params.id },
          data: { loyaltyPoints: newPoints },
        }),
        prisma.loyaltyTransaction.create({
          data: {
            customerId: params.id,
            points: loyaltyAdjustment,
            type: loyaltyAdjustment > 0 ? "BONUS" : "ADJUSTMENT",
            description:
              loyaltyReason ||
              `Manual ${loyaltyAdjustment > 0 ? "bonus" : "adjustment"} by staff`,
          },
        }),
      ]);
    }

    // Return updated customer
    const updated = await prisma.profile.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        staffNotes: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
