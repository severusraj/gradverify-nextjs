"use server";

import { prisma } from "@/db/prisma";
import { z } from "zod";
import { getSignedDownloadUrl } from "@/lib/utils/s3";
import { SubmissionStatus } from "@prisma/client";

const updateSchema = z.object({
  studentId: z.string(),
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().optional(),
  type: z.enum(["PSA", "AWARD"]),
});

async function calculateOverallStatus(studentId: string, type: string, newStatus: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { psaStatus: true, awardStatus: true },
  });
  if (!student) return "PENDING";
  const psaStatus = type === "PSA" ? newStatus : student.psaStatus;
  const awardStatus = type === "AWARD" ? newStatus : student.awardStatus;
  if (psaStatus === SubmissionStatus.REJECTED || awardStatus === SubmissionStatus.REJECTED) return SubmissionStatus.REJECTED;
  if (psaStatus === SubmissionStatus.APPROVED && (awardStatus === SubmissionStatus.APPROVED || awardStatus === SubmissionStatus.NOT_SUBMITTED)) return SubmissionStatus.APPROVED;
  if (psaStatus === SubmissionStatus.APPROVED || awardStatus === SubmissionStatus.APPROVED) return SubmissionStatus.PENDING;
  return SubmissionStatus.PENDING;
}

export async function updateStudentVerificationStatus({ studentId, status, feedback, type }: {
  studentId: string;
  status: "APPROVED" | "REJECTED";
  feedback?: string;
  type: "PSA" | "AWARD";
}) {
  try {
    const validation = updateSchema.safeParse({ studentId, status, feedback, type });
    if (!validation.success) {
      return { success: false, message: "Invalid request data", details: validation.error.format() };
    }
    const overallStatus = await calculateOverallStatus(studentId, type, status);
    const updateData: Record<string, unknown> = {
      feedback: feedback || null,
      overallStatus: overallStatus as SubmissionStatus,
    };
    if (type === "PSA") {
      updateData.psaStatus = status as SubmissionStatus;
    } else if (type === "AWARD") {
      updateData.awardStatus = status as SubmissionStatus;
    }
    const updatedProfile = await prisma.studentProfile.update({
      where: { id: studentId },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    return { success: true, student: updatedProfile };
  } catch (error) {
    console.error("Update verification error:", error);
    return { success: false, message: "Failed to update verification status" };
  }
}

export async function getStudentPSAUrl(studentId: string) {
  try {
    if (!studentId) {
      return { success: false, error: "Student ID is required" };
    }
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { psaS3Key: true }
    });
    if (!student) {
      return { success: false, error: "Student not found" };
    }
    if (!student.psaS3Key) {
      return { success: false, error: "PSA file not found" };
    }
    const url = await getSignedDownloadUrl(student.psaS3Key);
    return { success: true, url };
  } catch (error) {
    console.error("Error fetching PSA URL:", error);
    return { success: false, error: "Failed to fetch PSA URL" };
  }
}

const verificationListSchema = z.object({
  department: z.string().optional(),
  status: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export async function getSuperadminVerificationList({ department = "all", status = "all", page = 1, limit = 10 }: {
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  try {
    // Build where clause
    const where: any = {};
    if (department && department !== "all") {
      where.department = department;
    }
    if (status && status !== "all") {
      where.overallStatus = status;
    }
    // Get total count for pagination
    const total = await prisma.studentProfile.count({ where });
    // Fetch student profiles with pagination
    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    // Stats
    const [pending, approved, rejected] = await Promise.all([
      prisma.studentProfile.count({ where: { ...where, overallStatus: "PENDING" } }),
      prisma.studentProfile.count({ where: { ...where, overallStatus: "APPROVED" } }),
      prisma.studentProfile.count({ where: { ...where, overallStatus: "REJECTED" } }),
    ]);
    return {
      success: true,
      data: {
        students,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
          limit,
        },
        stats: {
          total,
          pending,
          approved,
          rejected,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching verification list:", error);
    return { success: false, error: "Failed to fetch verification list" };
  }
} 