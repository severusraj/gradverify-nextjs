import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { withFaculty } from "@/lib/api-middleware";
import { SubmissionStatus } from "@prisma/client";

async function handler(req: NextRequest) {
  try {
    // Count student profiles by status
    const [pending, approved, rejected, notSubmitted, total] = await Promise.all([
      prisma.studentProfile.count({ where: { psaStatus: SubmissionStatus.PENDING } }),
      prisma.studentProfile.count({ where: { psaStatus: SubmissionStatus.APPROVED } }),
      prisma.studentProfile.count({ where: { psaStatus: SubmissionStatus.REJECTED } }),
      prisma.studentProfile.count({ where: { psaStatus: SubmissionStatus.NOT_SUBMITTED } }),
      prisma.studentProfile.count({}),
    ]);

    return NextResponse.json({
      stats: {
        pending,
        approved,
        rejected,
        notSubmitted,
        total,
      },
    });
  } catch (error) {
    return NextResponse.json({
      stats: { pending: 0, approved: 0, rejected: 0, notSubmitted: 0, total: 0 },
      error: "Failed to fetch stats",
    }, { status: 500 });
  }
}

export const GET = withFaculty(handler); 