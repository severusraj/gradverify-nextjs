export const runtime = "nodejs";
import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";

async function handler(req: NextRequest) {
  try {
    // Get all required statistics in parallel
    const [
      totalStudents,
      pendingStudents,
      approvedStudents,
      rejectedStudents,
      totalUsers,
      recentSubmissions,
      departmentStats,
      weeklyStats
    ] = await Promise.all([
      // Total students count
      prisma.studentProfile.count(),
      
      // Pending students count
      prisma.studentProfile.count({ 
        where: { status: "PENDING" } 
      }),
      
      // Approved students count
      prisma.studentProfile.count({ 
        where: { status: "APPROVED" } 
      }),
      
      // Rejected students count
      prisma.studentProfile.count({ 
        where: { status: "REJECTED" } 
      }),
      
      // Total users count (excluding students)
      prisma.user.count({
        where: {
          role: {
            in: ["ADMIN", "FACULTY"]
          }
        }
      }),
      
      // Recent submissions with user details
      prisma.studentProfile.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      
      // Department statistics
      prisma.studentProfile.groupBy({
        by: ['department'],
        _count: {
          _all: true,
        },
        where: {
          status: "APPROVED"
        }
      }),
      
      // Weekly statistics for the last 7 days
      prisma.studentProfile.groupBy({
        by: ['createdAt'],
        _count: {
          _all: true,
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    // Format department statistics
    const formattedDepartmentStats = departmentStats.map(dept => ({
      department: dept.department,
      total: dept._count._all,
      approved: dept._count._all,
      pending: totalStudents - dept._count._all
    }));

    // Format weekly statistics
    const formattedWeeklyStats = weeklyStats.map(stat => ({
      date: stat.createdAt,
      count: stat._count._all
    }));

    return apiResponse({
      statistics: {
        totalStudents,
        pendingStudents,
        approvedStudents,
        rejectedStudents,
        totalUsers,
      },
      recentSubmissions,
      departmentStats: formattedDepartmentStats,
      weeklyStats: formattedWeeklyStats
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler); 