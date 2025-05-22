import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { getSignedDownloadUrl } from "@/lib/s3";
import { z } from "zod";
import { SubmissionStatus } from '@/generated/prisma';
import type { Prisma } from '@/generated/prisma';

export const runtime = "nodejs";

// Validation schema for verification update
const verificationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().optional(),
});

const updateSchema = z.object({
  studentId: z.string(),
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().optional(),
  type: z.enum(["PSA", "AWARD"]),
});

async function handler(req: NextRequest) {
  try {
    if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const search = searchParams.get("search") || "";
      const status = searchParams.get("status") || "";
      const department = searchParams.get("department") || "";

      // Build Prisma WHERE clause object
      const where: Prisma.StudentProfileWhereInput = {};

      if (status && status.toLowerCase() !== "all") {
        where.overallStatus = status.toUpperCase() as SubmissionStatus;
      }

      if (search) {
        where.user = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      if (department && department.toLowerCase() !== "all") {
        where.department = { contains: department, mode: 'insensitive' };
      }

      // Count total using ORM
      const total = await prisma.studentProfile.count({ where });

      // Fetch students using ORM with pagination
      const students = await prisma.studentProfile.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // For stats, ignore status filter but apply department filter if present
      const statsWhere: Prisma.StudentProfileWhereInput = {};
      if (department && department.toLowerCase() !== "all") {
        statsWhere.department = { contains: department, mode: 'insensitive' };
      }

      const [totalStats, pending, approved, rejected] = await Promise.all([
        prisma.studentProfile.count({ where: statsWhere }),
        prisma.studentProfile.count({ where: { ...statsWhere, overallStatus: SubmissionStatus.PENDING } }),
        prisma.studentProfile.count({ where: { ...statsWhere, overallStatus: SubmissionStatus.APPROVED } }),
        prisma.studentProfile.count({ where: { ...statsWhere, overallStatus: SubmissionStatus.REJECTED } }),
      ]);

      // Format students data to match previous raw query output structure if necessary
      // (Assuming the previous raw query structure is desired by the frontend)
      const formattedStudents = students.map(student => ({
        ...student,
        user: { // Reconstruct user object if it was flattened in raw query
          name: student.user.name,
          email: student.user.email,
        },
      }));

      return apiResponse({
        students: formattedStudents,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
          limit,
        },
        stats: {
          total: totalStats,
          pending,
          approved,
          rejected,
        },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const validation = updateSchema.safeParse(body);
      if (!validation.success) {
        return apiResponse({ error: "Invalid request data", details: validation.error.format() }, 400);
      }
      const { studentId, status, feedback, type } = validation.data;
      const overallStatus = await calculateOverallStatus(studentId, type, status);
      
      // Use ORM update for better type safety and handling
      const updateData: any = {
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
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      });

      // Format updated student data to match expected structure
      const formattedUpdatedStudent = {
        ...updatedProfile,
         user: { // Reconstruct user object if necessary
          name: updatedProfile.user.name,
          email: updatedProfile.user.email,
        },
      };

      return apiResponse({ student: formattedUpdatedStudent });
    }

    return apiResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    return handleApiError(error);
  }
}

// This function can remain as is or be refactored to use ORM as well
async function calculateOverallStatus(studentId: string, type: string, newStatus: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { psaStatus: true, awardStatus: true },
  });

  if (!student) return "PENDING"; // Should not happen if studentId is valid

  const psaStatus = type === "PSA" ? newStatus : student.psaStatus;
  const awardStatus = type === "AWARD" ? newStatus : student.awardStatus;

  if (psaStatus === SubmissionStatus.REJECTED || awardStatus === SubmissionStatus.REJECTED) return SubmissionStatus.REJECTED;
  if (psaStatus === SubmissionStatus.APPROVED && (awardStatus === SubmissionStatus.APPROVED || awardStatus === SubmissionStatus.NOT_SUBMITTED)) return SubmissionStatus.APPROVED;
  
  // Handle cases where only one is approved, or both are pending/not_submitted
   if (psaStatus === SubmissionStatus.APPROVED || awardStatus === SubmissionStatus.APPROVED) return SubmissionStatus.PENDING; // Needs both required and optional approved for overall approved

  return SubmissionStatus.PENDING;
}

// PSA file viewing endpoint (GET /psa-url?studentId=...)
// Keeping as raw query for simplicity, assuming it was working
export async function GET_psaUrl(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) return apiResponse({ error: "Missing studentId" }, 400);
    
    // Can also be refactored to ORM: prisma.studentProfile.findUnique({ where: { id: studentId }, select: { psaS3Key: true } });
    const profile = await prisma.$queryRaw<{ psaS3Key: string }[]>`
      SELECT "psaS3Key" FROM "StudentProfile" WHERE id = ${studentId}
    `;
    
    if (!profile || !profile[0]?.psaS3Key) return apiResponse({ error: "No PSA found" }, 404);
    const url = await getSignedDownloadUrl(profile[0].psaS3Key);
    return apiResponse({ url });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler);
export const PUT = withSuperAdmin(handler); 