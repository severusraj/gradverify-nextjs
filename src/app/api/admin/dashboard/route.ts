import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { withAdmin } from "@/lib/api-middleware";

async function handler(req: NextRequest) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const totalSubmissions = await prisma.studentProfile.count();
    const pendingSubmissions = await prisma.studentProfile.count({
      where: { overallStatus: "PENDING" },
    });
    const approvedSubmissions = await prisma.studentProfile.count({
      where: { overallStatus: "APPROVED" },
    });
    const rejectedSubmissions = await prisma.studentProfile.count({
      where: { overallStatus: "REJECTED" },
    });

    const recentSubmissions = await prisma.studentProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 5, // Get the 5 most recent submissions
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedRecentSubmissions = recentSubmissions.map((submission) => ({
      id: submission.id,
      studentName: submission.user?.name || "Unknown",
      status: submission.overallStatus,
      createdAt: submission.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      recentSubmissions: formattedRecentSubmissions,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(handler); 