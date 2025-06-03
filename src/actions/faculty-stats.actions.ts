"use server";

import { prisma } from "@/db/prisma";

export async function getFacultyStats() {
  try {
    const [pending, approved, rejected, notSubmitted, total] = await Promise.all([
      prisma.studentProfile.count({ where: { psaStatus: "PENDING" } }),
      prisma.studentProfile.count({ where: { psaStatus: "APPROVED" } }),
      prisma.studentProfile.count({ where: { psaStatus: "REJECTED" } }),
      prisma.studentProfile.count({ where: { psaStatus: "NOT_SUBMITTED" } }),
      prisma.studentProfile.count({}),
    ]);
    return {
      stats: { pending, approved, rejected, notSubmitted, total },
    };
  } catch (error) {
    return {
      stats: { pending: 0, approved: 0, rejected: 0, notSubmitted: 0, total: 0 },
      error: "Failed to fetch stats",
    };
  }
} 