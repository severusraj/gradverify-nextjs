"use server";

import { prisma } from "@/db/prisma";
import { z } from "zod";
import { subDays, startOfDay, endOfDay } from "date-fns";

const reportQuerySchema = z.object({
  type: z.enum(["verification", "department", "awards", "analytics"]).optional(),
  period: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function getDateRange({ period, startDate, endDate }: { period?: string; startDate?: string; endDate?: string }) {
  if (startDate && endDate) {
    return {
      createdAt: {
        gte: startOfDay(new Date(startDate)),
        lte: endOfDay(new Date(endDate)),
      },
    };
  } else if (period) {
    const now = new Date();
    let start = now;
    switch (period) {
      case "daily": start = subDays(now, 1); break;
      case "weekly": start = subDays(now, 7); break;
      case "monthly": start = subDays(now, 30); break;
      case "quarterly": start = subDays(now, 90); break;
      case "yearly": start = subDays(now, 365); break;
    }
    return {
      createdAt: {
        gte: startOfDay(start),
        lte: endOfDay(now),
      },
    };
  }
  return {};
}

export async function getSuperadminReport({ type, period, startDate, endDate }: {
  type?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  const dateRange = getDateRange({ period, startDate, endDate });
  switch (type) {
    case "verification":
      return await getVerificationReport(dateRange);
    case "department":
      return await getDepartmentReport(dateRange);
    case "awards":
      return await getAwardsReport(dateRange);
    case "analytics":
      return await getAnalyticsReport(dateRange);
    default:
      return await getRecentReports();
  }
}

async function getVerificationReport(dateRange: any) {
  const [verificationStats, processingTimes, documentTypes] = await Promise.all([
    prisma.studentProfile.groupBy({ by: ['overallStatus'], _count: true, where: dateRange }),
    prisma.studentProfile.findMany({ where: { ...dateRange, overallStatus: { in: ["APPROVED", "REJECTED"] } }, select: { createdAt: true, updatedAt: true, program: true } }),
    prisma.studentProfile.groupBy({ by: ['program'], _count: true, where: dateRange }),
  ]);
  const processingTimeByProgram = processingTimes.reduce((acc: any, curr: any) => {
    const program = curr.program;
    const processingTime = (curr.updatedAt.getTime() - curr.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (!acc[program]) acc[program] = { total: 0, count: 0 };
    acc[program].total += processingTime;
    acc[program].count += 1;
    return acc;
  }, {});
  const avgProcessingTimes = Object.entries(processingTimeByProgram).map(([program, data]: [string, any]) => ({ program, avgProcessingDays: data.total / data.count }));
  return { verificationStats, avgProcessingTimes, documentTypes };
}

async function getDepartmentReport(dateRange: any) {
  const [departmentStats, programStats, studentCounts] = await Promise.all([
    prisma.studentProfile.groupBy({ by: ['department'], _count: true, where: dateRange }),
    prisma.studentProfile.groupBy({ by: ['program'], _count: true, where: dateRange }),
    prisma.studentProfile.groupBy({ by: ['department', 'overallStatus'], _count: true, where: dateRange }),
  ]);
  return { departmentStats, programStats, studentCounts };
}

async function getAwardsReport(dateRange: any) {
  const [awardStats, departmentAwards, recentAwards] = await Promise.all([
    prisma.award.groupBy({ by: ['status'], _count: true, where: dateRange }),
    prisma.award.groupBy({ by: ['category'], _count: true, where: dateRange }),
    prisma.award.findMany({
      where: dateRange,
      include: {
        student: {
          select: {
            name: true,
            email: true,
            studentProfile: {
              select: {
                department: true,
                program: true,
                studentId: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    }),
  ]);
  return { awardStats, departmentAwards, recentAwards };
}

async function getAnalyticsReport(dateRange: any) {
  const [userStats, verificationStats, departmentStats, recentActivity] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: true }),
    prisma.studentProfile.groupBy({ by: ['overallStatus'], _count: true, where: dateRange }),
    prisma.studentProfile.groupBy({ by: ['department'], _count: true, where: dateRange }),
    prisma.auditLog.findMany({ where: dateRange, orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { name: true, email: true, role: true } } } }),
  ]);
  return { userStats, verificationStats, departmentStats, recentActivity };
}

async function getRecentReports() {
  const recentVerifications = await prisma.studentProfile.findMany({ take: 5, orderBy: { updatedAt: 'desc' }, include: { user: { select: { name: true, email: true } } } });
  const recentAwards = await prisma.award.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      student: {
        select: {
          name: true,
          email: true,
          studentProfile: {
            select: {
              department: true,
              program: true,
              studentId: true
            }
          }
        }
      }
    }
  });
  return { recentVerifications, recentAwards };
} 