import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withFaculty } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { SubmissionStatus } from "@prisma/client";

// Define types for the response
interface StudentResponse {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  program: string;
  status: SubmissionStatus;
  psaFile?: string;
  gradPhoto?: string;
  createdAt?: string;
}

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("pageSize") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;
    const sort = searchParams.get("sort");

    // Build where clause for studentProfile
    const where: any = {
      ...(department && department !== "All" ? { department } : {}),
      ...(status && status !== "All" ? { psaStatus: status.toUpperCase() as SubmissionStatus } : {}),
    };

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    if (sort === "asc") orderBy = { createdAt: "asc" };

    // Fetch total count for pagination
    const total = await prisma.studentProfile.count({ where });

    // Fetch student profiles and join user info
    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Transform the data to flatten user info
    const transformedStudents: StudentResponse[] = students.map(student => ({
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

    return apiResponse({ students: transformedStudents, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withFaculty(handler); 