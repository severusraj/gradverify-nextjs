import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { withFaculty } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { Prisma, Role, SubmissionStatus } from "@prisma/client";

async function handler(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const studentId = context.params.studentId;
    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const { action, feedback } = await req.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the current user (faculty)
    const currentUser = await prisma.user.findFirst({
      where: { role: Role.FACULTY }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update student profile status
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: studentId },
      data: {
        psaStatus: action === "approve" ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED,
        feedback: feedback || null
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: action === "approve" ? "APPROVE_DOCUMENT" : "REJECT_DOCUMENT",
        details: `Document ${action}ed by faculty member`
      }
    });

    return NextResponse.json({ 
      message: `Document ${action}ed successfully`,
      profile: updatedProfile
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withFaculty(handler); 