import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-middleware";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/current-user";

export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id;

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
    }

    // Update user's profile
    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    return NextResponse.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}); 