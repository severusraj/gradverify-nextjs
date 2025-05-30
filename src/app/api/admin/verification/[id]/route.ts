import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/utils/current-user";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  // Role check
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Verification ID is required" }, { status: 400 });
  }
  try {
    const submission = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }
    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission details:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  // Role check
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Verification ID is required" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const { psaStatus, awardStatus, feedback } = body;
    // Update individual document statuses and feedback
    const updatedSubmission = await prisma.studentProfile.update({
      where: { id },
      data: {
        psaStatus: psaStatus || undefined,
        awardStatus: awardStatus || undefined,
        feedback: feedback || undefined,
      },
      // Include user data in the response after update
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    // Determine new overall status
    let newOverallStatus = updatedSubmission.overallStatus; // Keep current if no change
    if (updatedSubmission.psaStatus === "APPROVED" && updatedSubmission.awardStatus === "APPROVED") {
      newOverallStatus = "APPROVED";
    } else if (updatedSubmission.psaStatus === "REJECTED" || updatedSubmission.awardStatus === "REJECTED") {
      newOverallStatus = "REJECTED";
    }
    // Update overall status if it changed
    if (newOverallStatus !== updatedSubmission.overallStatus) {
      await prisma.studentProfile.update({
        where: { id },
        data: { overallStatus: newOverallStatus },
      });
    }
    // You can add notification logic here later if needed
    return NextResponse.json({ success: true, data: updatedSubmission });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
} 