import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLoyaltyTier } from "@/lib/utils";
import { LoyaltyTier } from "@prisma/client";

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

    // Adjust loyalty points atomically
    if (loyaltyAdjustment && typeof loyaltyAdjustment === "number") {
      await prisma.$transaction([
        prisma.profile.update({
          where: { id: params.id },
          data: { loyaltyPoints: { increment: loyaltyAdjustment } },
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

      // Clamp loyalty points to 0 minimum
      const updated = await prisma.profile.findUnique({ where: { id: params.id }, select: { loyaltyPoints: true } });
      if (updated && updated.loyaltyPoints < 0) {
        await prisma.profile.update({ where: { id: params.id }, data: { loyaltyPoints: 0 } });
      }
    }

    // Re-read the updated profile to get current points and calculate tier
    const updatedProfile = await prisma.profile.findUnique({
      where: { id: params.id },
      select: { loyaltyPoints: true },
    });

    if (updatedProfile) {
      const newTier = calculateLoyaltyTier(updatedProfile.loyaltyPoints);
      await prisma.profile.update({
        where: { id: params.id },
        data: { loyaltyTier: newTier as LoyaltyTier },
      });
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
