import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    // Check if the current user is a super admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all admin and faculty users
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "FACULTY"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 