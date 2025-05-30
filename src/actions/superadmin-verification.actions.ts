"use server";

import { prisma } from "@/db/prisma";
import { z } from "zod";
import { SubmissionStatus } from '@/generated/prisma';

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