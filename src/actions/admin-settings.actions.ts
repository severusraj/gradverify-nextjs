'use server';

import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/utils/current-user";
import { revalidatePath } from "next/cache";

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    if (!currentPassword || !newPassword) {
      throw new Error("Current and new passwords are required");
    }

    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !dbUser.password) {
      throw new Error("User not found or password not set");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect current password");
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    revalidatePath('/dashboard');
    return { success: true, message: "Password updated successfully" };

  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

export async function updateAdminProfile(data: { name: string; email: string }) {
  try {
    const { name, email } = data;

    if (!name || !email) {
      return { success: false, message: "Name and email are required" };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Not authenticated" };
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
      return { success: false, message: "Email is already taken" };
    }

    // Update user's profile
    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
} 