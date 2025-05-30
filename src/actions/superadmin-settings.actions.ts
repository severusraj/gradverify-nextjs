"use server";

import { prisma } from "@/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/auth-utils";
import { getCurrentUser } from "@/lib/utils/current-user";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const passwordSchema = z.object({
  current: z.string().min(8),
  new: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirm: z.string().min(8),
});

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export async function updateProfile({ name, email }: { name: string; email: string }) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const validation = profileSchema.safeParse({ name, email });
    if (!validation.success) {
      return { success: false, message: "Invalid request data", details: validation.error.format() };
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: user.id }
      }
    });

    if (existingUser) {
      return { success: false, message: "Email is already taken" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { name, email }
    });

    revalidatePath('/dashboard');
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

export async function superadminChangePassword({ current, new: newPassword, confirm }: {
  current: string;
  new: string;
  confirm: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthorized" };
    const validation = passwordSchema.safeParse({ current, new: newPassword, confirm });
    if (!validation.success) {
      return { success: false, message: "Invalid request data", details: validation.error.format() };
    }
    if (newPassword !== confirm) {
      return { success: false, message: "Passwords do not match" };
    }
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return { success: false, message: "User not found" };
    const valid = await verifyPassword(current, dbUser.password);
    if (!valid) return { success: false, message: "Current password is incorrect" };
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    revalidatePath('/dashboard');
    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to change password" };
  }
} 