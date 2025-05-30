import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(req: NextRequest, context: { params: { studentId: string } }) {
  try {
    const { studentId } = context.params;
    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const { action, feedback } = await req.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the current user (faculty)
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update student profile status
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: studentId },
      data: {
        psaStatus: action === "approve" ? "APPROVED" : "REJECTED",
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 