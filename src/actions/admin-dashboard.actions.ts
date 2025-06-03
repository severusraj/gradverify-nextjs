"use server";

import { prisma } from "@/db/prisma";

type StudentProfileWithUser = {
  id: string;
  overallStatus: string;
  createdAt: Date;
  user: {
    name: string | null;
  } | null;
};

export async function getAdminDashboardData() {
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
      take: 5,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedRecentSubmissions = recentSubmissions.map((submission: StudentProfileWithUser) => ({
      id: submission.id,
      studentName: submission.user?.name || "Unknown",
      status: submission.overallStatus,
      createdAt: submission.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: {
        totalSubmissions,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        recentSubmissions: formattedRecentSubmissions,
      },
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard data",
    };
  }
} 