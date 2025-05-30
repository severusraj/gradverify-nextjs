"use server";

import { prisma } from "@/db/prisma";

export async function adminBulkRejectVerifications({ ids }: { ids: string[] }) {
  try {
    if (!Array.isArray(ids)) {
      return { success: false, message: "Invalid ids" };
    }
    await prisma.studentProfile.updateMany({
      where: { id: { in: ids } },
      data: {
        psaStatus: "REJECTED",
        awardStatus: "REJECTED",
        overallStatus: "REJECTED",
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Bulk reject error:", error);
    return { success: false, message: "Failed to reject submissions" };
  }
} 