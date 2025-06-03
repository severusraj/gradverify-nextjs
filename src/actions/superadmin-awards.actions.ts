"use server";

import { getSignedDownloadUrl } from "@/lib/utils/s3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAwardViewUrl(s3Key: string) {
  try {
    if (!s3Key) {
      return { success: false, error: "S3 key is required" };
    }

    const signedUrl = await getSignedDownloadUrl(s3Key);
    return { success: true, url: signedUrl };
  } catch (error) {
    console.error("Error fetching award view URL:", error);
    return { success: false, error: "Failed to get award view URL" };
  }
}

export async function getAwardDownloadUrl(s3Key: string) {
  try {
    if (!s3Key) {
      return { success: false, error: "S3 key is required" };
    }

    const signedUrl = await getSignedDownloadUrl(s3Key);
    return { success: true, url: signedUrl };
  } catch (error) {
    console.error("Error fetching award download URL:", error);
    return { success: false, error: "Failed to get award download URL" };
  }
}

export async function getSuperadminAwards({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
  try {
    const skip = (page - 1) * limit;
    const total = await prisma.award.count();
    const awards = await prisma.award.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        year: true,
        s3Key: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            name: true,
            email: true,
            studentProfile: {
              select: {
                studentId: true,
                program: true,
                department: true
              }
            }
          }
        }
      }
    });
    return {
      success: true,
      awards,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching awards:", error);
    return { success: false, error: "Failed to fetch awards" };
  }
}

export async function updateAwardStatus({ awardId, status, feedback }: { awardId: string; status: "APPROVED" | "REJECTED"; feedback?: string }) {
  try {
    const award = await prisma.award.update({
      where: { id: awardId },
      data: { status },
      include: {
        student: {
          select: {
            studentProfile: true
          }
        }
      }
    });

    // Update student profile award status
    if (award.student.studentProfile) {
      const studentProfile = award.student.studentProfile;
      const allAwards = await prisma.award.findMany({
        where: { studentId: award.studentId }
      });

      // If any award is rejected, mark overall as rejected
      // If all awards are approved, mark overall as approved
      // Otherwise, keep as pending
      const newAwardStatus = allAwards.some((a: { status: string }) => a.status === "REJECTED") 
        ? "REJECTED" 
        : allAwards.every((a: { status: string }) => a.status === "APPROVED")
          ? "APPROVED"
          : "PENDING";

      await prisma.studentProfile.update({
        where: { id: studentProfile.id },
        data: { 
          awardStatus: newAwardStatus,
          feedback: feedback || null
        }
      });
    }

    return { success: true, award };
  } catch (error) {
    console.error("Error updating award status:", error);
    return { success: false, error: "Failed to update award status" };
  }
} 