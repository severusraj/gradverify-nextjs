import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/current-user";
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

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const department = searchParams.get("department") || "";

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
  const total = await prisma.studentProfile.count({ where });
  const students = await prisma.studentProfile.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });
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
  const formattedStudents = students.map(student => ({
    ...student,
    user: {
      name: student.user.name,
      email: student.user.email,
    },
  }));
  return NextResponse.json({
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

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const validation = updateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 });
  }
  const { studentId, status, feedback, type } = validation.data;
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
  const formattedUpdatedStudent = {
    ...updatedProfile,
    user: {
      name: updatedProfile.user.name,
      email: updatedProfile.user.email,
    },
  };
  return NextResponse.json({ student: formattedUpdatedStudent });
}

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