"use server";

import { prisma } from "@/db/prisma";
import { getSessionUser, type AuthPayload } from "@/lib/auth/auth";

export async function getSuperadminDashboardStats() {
  try {
    const user = await getSessionUser<AuthPayload>();
    if (!user || user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const [
      totalStudents,
      totalAdmins,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      submissionsByDepartment,
      submissionsByDate,
      recentSubmissions,
      recentAwards
    ] = await Promise.all([
      // Total students
      prisma.studentProfile.count(),
      // Total admins (including superadmins)
      prisma.user.count({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN"] }
        }
      }),
      // Pending submissions
      prisma.studentProfile.count({
        where: { overallStatus: "PENDING" }
      }),
      // Approved submissions
      prisma.studentProfile.count({
        where: { overallStatus: "APPROVED" }
      }),
      // Rejected submissions
      prisma.studentProfile.count({
        where: { overallStatus: "REJECTED" }
      }),
      // Submissions by department
      prisma.studentProfile.groupBy({
        by: ["department"],
        where: { overallStatus: "PENDING" },
        _count: true
      }),
      // Submissions by date (last 7 days)
      prisma.studentProfile.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        _count: true,
        orderBy: { createdAt: "asc" }
      }),
      // Recent submissions with user details
      prisma.studentProfile.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      // Recent awards
      prisma.award.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              name: true,
              email: true,
              studentProfile: {
                select: {
                  studentId: true,
                  program: true,
                  department: true
                }
              }
            }
          }
        }
      })
    ]);

    return {
      success: true,
      stats: {
        totalStudents,
        totalAdmins,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        submissionsByDepartment,
        submissionsByDate,
        recentSubmissions,
        recentAwards
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
} 