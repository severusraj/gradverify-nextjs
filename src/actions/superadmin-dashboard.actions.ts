"use server";

import { cache } from "react";
import { prisma } from "@/db/prisma";
import { getSessionUser, type AuthPayload } from "@/lib/auth/auth";

export const getSuperadminDashboardStats = cache(async () => {
  try {
    const user = await getSessionUser<AuthPayload>();
    if (!user || user.role !== "SUPER_ADMIN") {
      return { success: false, message: "Forbidden" };
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
});

// Lightweight counts-only query so we can stream statistics quickly
export const getSuperadminDashboardCounts = cache(async () => {
  try {
    const user = await getSessionUser<AuthPayload>();
    if (!user || user.role !== "SUPER_ADMIN") {
      return { success: false, message: "Forbidden" } as const;
    }

    // Run the count queries in parallel
    const [totalStudents, totalAdmins, pendingSubmissions] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
      prisma.studentProfile.count({ where: { overallStatus: "PENDING" } })
    ]);

    return {
      success: true,
      counts: {
        totalStudents,
        totalAdmins,
        pendingSubmissions
      }
    } as const;
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    return { success: false, error: "Failed to fetch dashboard counts" } as const;
  }
});

// Fetch only the 5 most recent submissions (user + status)
export const getSuperadminRecentSubmissions = cache(async () => {
  try {
    const user = await getSessionUser<AuthPayload>();
    if (!user || user.role !== "SUPER_ADMIN") {
      return { success: false, message: "Forbidden" } as const;
    }

    const recentSubmissions = await prisma.studentProfile.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return { success: true, submissions: recentSubmissions } as const;
  } catch (error) {
    console.error("Error fetching recent submissions:", error);
    return { success: false, error: "Failed to fetch recent submissions" } as const;
  }
});

// Fetch only the 5 most recent awards
export const getSuperadminRecentAwards = cache(async () => {
  try {
    const user = await getSessionUser<AuthPayload>();
    if (!user || user.role !== "SUPER_ADMIN") {
      return { success: false, message: "Forbidden" } as const;
    }

    const recentAwards = await prisma.award.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            name: true,
            email: true,
            studentProfile: {
              select: { studentId: true, program: true, department: true }
            }
          }
        }
      }
    });

    return { success: true, awards: recentAwards } as const;
  } catch (error) {
    console.error("Error fetching recent awards:", error);
    return { success: false, error: "Failed to fetch recent awards" } as const;
  }
}); 