import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { z } from "zod";

// Validation schema for request body
const updateSchema = z.object({
  psaStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  awardStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  overallStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  rejectionReason: z.string().optional(),
});

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
  }
  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }
  return NextResponse.json({ student });
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
  }
  const body = await req.json();
  const validation = updateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { psaStatus, awardStatus, overallStatus, rejectionReason } = validation.data;
  const updatedStudent = await prisma.studentProfile.update({
    where: { id },
    data: {
      ...(psaStatus && { psaStatus }),
      ...(awardStatus && { awardStatus }),
      ...(overallStatus && { overallStatus }),
      ...(rejectionReason && { rejectionReason }),
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return NextResponse.json({ student: updatedStudent });
} 