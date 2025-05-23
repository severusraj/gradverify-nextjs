import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { withAdmin } from "@/lib/api-middleware";

async function handler(req: NextRequest, context: { params: Record<string, string> }) {
  const id = context.params.id;

  if (req.method === "GET") {
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

  if (req.method === "POST") {
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

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = withAdmin(handler);
export const POST = withAdmin(handler); 