import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if the current user is a super admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId } = params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Only allow deleting admin and faculty users
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Cannot delete super admin users" },
        { status: 400 }
      );
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 