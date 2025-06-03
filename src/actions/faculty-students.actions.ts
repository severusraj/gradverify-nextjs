"use server";

import { prisma } from "@/db/prisma";

interface GetFacultyStudentsParams {
  department?: string;
  status?: string;
  pageSize?: number;
  page?: number;
  sort?: "asc" | "desc";
}

export async function getFacultyStudents({ department, status, pageSize = 10, page = 1, sort = "desc" }: GetFacultyStudentsParams) {
  try {
    const limit = pageSize;
    const skip = (page - 1) * limit;
    let orderBy: Record<string, unknown> = { createdAt: sort };

    const where: Record<string, unknown> = {
      ...(department && department !== "All" ? { department } : {}),
      ...(status && status !== "All" ? { psaStatus: status.toUpperCase() } : {}),
    };

    const total = await prisma.studentProfile.count({ where });
    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy,
      skip,
      take: limit,
    });

    const transformedStudents = students.map((student: any) => ({
      id: student.id,
      name: student.user?.name || "",
      email: student.user?.email || "",
      studentId: student.studentId || "",
      department: student.department || "",
      program: student.program || "",
      status: student.psaStatus || "PENDING",
      psaFile: student.psaS3Key || undefined,
      gradPhoto: student.gradPhotoS3Key || undefined,
      createdAt: student.createdAt?.toISOString?.() || undefined,
    }));

    return { students: transformedStudents, total };
  } catch (error) {
    return { students: [], total: 0, error: "Failed to fetch students" };
  }
} 