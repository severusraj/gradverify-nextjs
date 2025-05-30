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