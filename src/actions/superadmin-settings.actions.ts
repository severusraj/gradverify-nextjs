"use server";

import { prisma } from "@/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";
import { getCurrentUser } from "@/lib/current-user";
import { z } from "zod";

const passwordSchema = z.object({
  current: z.string().min(8),
  new: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirm: z.string().min(8),
});

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
    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to change password" };
  }
} 