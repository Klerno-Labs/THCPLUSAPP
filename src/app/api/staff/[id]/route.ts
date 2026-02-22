import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// PATCH /api/staff/[id] — update a staff member
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof name === "string") updateData.name = name.trim();
    if (typeof email === "string") updateData.email = email.trim().toLowerCase();
    if (role !== undefined) {
      if (!["OWNER", "MANAGER", "STAFF"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const staff = await prisma.staffUser.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }
    console.error("Failed to update staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] — remove a staff member
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent deleting yourself
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.staffUser.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    console.error("Failed to delete staff:", error);
    return NextResponse.json(
      { error: "Failed to delete staff member" },
      { status: 500 }
    );
  }
}
