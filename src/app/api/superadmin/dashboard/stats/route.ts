import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Validation schema for date range
const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate date range
    const validation = dateRangeSchema.safeParse(query);
    if (!validation.success) {
      return apiResponse({ error: "Invalid date range" }, 400);
    }

    const { startDate, endDate } = validation.data;
    const dateFilter = {
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    // Get detailed statistics
    const [
      totalStudents,
      pendingStudents,
      approvedStudents,
      rejectedStudents,
      totalUsers,
      studentsByDepartment,
      studentsByProgram,
      recentActivity,
    ] = await Promise.all([
      // Total counts
      prisma.studentProfile.count({ where: dateFilter }),
      prisma.studentProfile.count({ 
        where: { ...dateFilter, status: "PENDING" } 
      }),
      prisma.studentProfile.count({ 
        where: { ...dateFilter, status: "APPROVED" } 
      }),
      prisma.studentProfile.count({ 
        where: { ...dateFilter, status: "REJECTED" } 
      }),
      prisma.user.count(),
      
      // Students by department
      prisma.studentProfile.groupBy({
        by: ['department'],
        where: dateFilter,
        _count: true,
      }),
      
      // Students by program
      prisma.studentProfile.groupBy({
        by: ['program'],
        where: dateFilter,
        _count: true,
      }),
      
      // Recent activity
      prisma.studentProfile.findMany({
        take: 10,
        where: dateFilter,
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return apiResponse({
      overview: {
        totalStudents,
        pendingStudents,
        approvedStudents,
        rejectedStudents,
        totalUsers,
      },
      distribution: {
        byDepartment: studentsByDepartment,
        byProgram: studentsByProgram,
      },
      recentActivity,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler); 