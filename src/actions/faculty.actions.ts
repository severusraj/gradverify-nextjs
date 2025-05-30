"use server";

import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/utils/current-user";
import bcrypt from "bcryptjs";

export async function facultyVerifyDocument({ studentId, action, feedback }: {
  studentId: string;
  action: "approve" | "reject";
  feedback?: string;
}) {
  try {
    if (!studentId) {
      return { success: false, message: "Student ID is required" };
    }
    if (!action || !["approve", "reject"].includes(action)) {
      return { success: false, message: "Invalid action" };
    }
    // Get the current user (faculty)
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "FACULTY") {
      return { success: false, message: "Unauthorized" };
    }
    // Update student profile status
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: studentId },
      data: {
        psaStatus: action === "approve" ? "APPROVED" : "REJECTED",
        feedback: feedback || null
      }
    });
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: action === "approve" ? "APPROVE_DOCUMENT" : "REJECT_DOCUMENT",
        details: `Document ${action}ed by faculty member`
      }
    });
    return {
      success: true,
      message: `Document ${action}ed successfully`,
      profile: updatedProfile
    };
  } catch (error) {
    console.error("Faculty verify document error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function facultyChangePassword({ currentPassword, newPassword }: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    if (!currentPassword || !newPassword) {
      return { success: false, message: "Current and new passwords are required" };
    }
    const user = await getCurrentUser();
    if (!user || user.role !== "FACULTY") {
      return { success: false, message: "Not authenticated" };
    }
    const userId = user.id;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || !dbUser.password) {
      return { success: false, message: "User not found or password not set" };
    }
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isPasswordValid) {
      return { success: false, message: "Incorrect current password" };
    }
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // Update user's password
    await prisma.user.update({ where: { id: userId }, data: { password: hashedNewPassword } });
    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Failed to change password" };
  }
}

export async function facultyUpdateProfile({ name, email }: {
  name: string;
  email: string;
}) {
  try {
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