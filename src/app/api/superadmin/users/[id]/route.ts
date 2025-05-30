import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hashPassword } from "@/lib/auth-utils";
import { z } from "zod";

// Validation schema for user update
const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "FACULTY"]).optional(),
  password: z.string().min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    .optional(),
});

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  const foundUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
    }
  });
  if (!foundUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user: foundUser });
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  const body = await req.json();
  const validation = updateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ 
      error: "Invalid request data", 
      details: validation.error.format() 
    }, { status: 400 });
  }
  const { name, role, password } = validation.data;
  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = name;
  if (role) updateData.role = role;
  if (password) {
    updateData.password = await hashPassword(password);
  }
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
  return NextResponse.json({ user: updatedUser });
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  const foundUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true }
  });
  if (!foundUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (foundUser.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (superAdminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last superadmin" }, { status: 400 });
    }
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "User deleted successfully" });
} 