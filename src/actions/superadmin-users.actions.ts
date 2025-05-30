"use server";

import { prisma } from "@/db/prisma";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/auth-utils";

const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  role: z.enum(["ADMIN", "FACULTY"]),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
});

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "FACULTY"]).optional(),
  password: z.string().min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    .optional(),
});

export async function createAdminOrFacultyUser({ name, email, role, password }: {
  name: string;
  email: string;
  role: "ADMIN" | "FACULTY";
  password: string;
}) {
  try {
    const validation = userSchema.safeParse({ name, email, role, password });
    if (!validation.success) {
      return { success: false, message: "Invalid request data", details: validation.error.format() };
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }
    // Hash password
    const hashedPassword = await hashPassword(password);
    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        lastLoginAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    return { success: true, user };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, message: "Failed to create user" };
  }
}

export async function updateAdminOrFacultyUser({ id, name, role, password }: {
  id: string;
  name?: string;
  role?: "ADMIN" | "FACULTY";
  password?: string;
}) {
  try {
    if (!id) return { success: false, message: "User ID is required" };
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) updateData.password = await hashPassword(password);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      }
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, message: "Failed to update user" };
  }
}

export async function deleteAdminOrFacultyUser({ id }: { id: string }) {
  try {
    if (!id) return { success: false, message: "User ID is required" };
    const foundUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!foundUser) return { success: false, message: "User not found" };
    if (foundUser.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
      if (superAdminCount <= 1) {
        return { success: false, message: "Cannot delete the last superadmin" };
      }
    }
    await prisma.user.delete({ where: { id } });
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user" };
  }
} 