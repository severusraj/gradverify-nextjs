"use server";

import { prisma } from "@/db/prisma";
import { unstable_cache } from "next/cache";

type StudentProfileWithUser = {
  id: string;
  overallStatus: string;
  createdAt: Date;
  user: {
    name: string | null;
  } | null;
};

const getCachedDashboardData = unstable_cache(
  async () => {
    try {
      // Use a single query with aggregation to get all counts
      const [statusCounts, recentSubmissions] = await Promise.all([
        prisma.studentProfile.groupBy({
          by: ['overallStatus'],
          _count: {
            _all: true,
          },
        }),
        prisma.studentProfile.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            overallStatus: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

      // Process status counts
      const statusMap = statusCounts.reduce((acc, item) => {
        acc[item.overallStatus] = item._count._all;
        return acc;
      }, {} as Record<string, number>);

      const totalSubmissions = statusCounts.reduce((sum, item) => sum + item._count._all, 0);
      const pendingSubmissions = statusMap.PENDING || 0;
      const approvedSubmissions = statusMap.APPROVED || 0;
      const rejectedSubmissions = statusMap.REJECTED || 0;

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
  },
  ['admin-dashboard-data'],
  {
    revalidate: 300, // Cache for 5 minutes
  }
);

export async function getAdminDashboardData() {
  return getCachedDashboardData();
} 