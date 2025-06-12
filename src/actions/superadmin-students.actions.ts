"use server";

import { prisma } from "@/db/prisma";
import { getSignedDownloadUrl } from "@/lib/utils/s3";

export async function getSuperadminStudents({ page = 1, limit = 10, overallStatus, search, hasAwards }: {
  page?: number;
  limit?: number;
  overallStatus?: "PENDING" | "APPROVED" | "REJECTED";
  search?: string;
  hasAwards?: boolean;
}) {
  try {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {
      ...(overallStatus && { overallStatus }),
      ...(search && {
        OR: [
          { studentId: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      }),
    };
    let students: any[] = [];
    let total = 0;
    if (hasAwards) {
      const studentIdsWithAwards = await prisma.award.findMany({
        select: { studentId: true },
        distinct: ["studentId"]
      });
      const ids = studentIdsWithAwards.map((a: { studentId: string }) => a.studentId);
      where.userId = { in: ids };
    }
    total = await prisma.studentProfile.count({ where });
    students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Map each student to include a temporary signed URL for the grad photo (valid for 1 hour)
    const studentsWithPhotoUrl = await Promise.all(
      students.map(async (s: any) => {
        let gradPhotoUrl: string | null = null;
        if (s.gradPhotoS3Key) {
          try {
            gradPhotoUrl = await getSignedDownloadUrl(s.gradPhotoS3Key);
          } catch (err) {
            console.error("Failed to generate signed URL for", s.gradPhotoS3Key, err);
          }
        }
        return { ...s, gradPhotoUrl };
      })
    );
    students = studentsWithPhotoUrl;

    return {
      success: true,
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch students" };
  }
} 