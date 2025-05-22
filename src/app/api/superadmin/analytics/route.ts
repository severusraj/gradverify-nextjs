import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { subDays, formatISO, startOfDay } from "date-fns";
import { SubmissionStatus } from '@prisma/client';

export const runtime = "nodejs";

async function handler(req: NextRequest) {
  try {
    if (req.method === "GET") {
      // Get range from query param
      const { searchParams } = new URL(req.url);
      const range = searchParams.get("range") || "30days";
      let days = 30;
      if (range === "7days") days = 7;
      if (range === "90days") days = 90;

      // Get total users by role
      const userStats = await prisma.user.groupBy({
        by: ['role'],
        _count: true
      });

      // Get verification status counts (using overallStatus via raw SQL)
      const verificationStats: { overallStatus: SubmissionStatus; count: bigint }[] = await prisma.$queryRaw`
        SELECT "overallStatus", COUNT(*) as count
        FROM "StudentProfile"
        GROUP BY "overallStatus"
      `;

      // Get department distribution
      const departmentStats = await prisma.studentProfile.groupBy({
        by: ['department'],
        _count: true
      });

      // Get document types distribution (by program)
      const documentTypes = await prisma.studentProfile.groupBy({
        by: ['program'],
        _count: true
      });

      // Get recent activity (last N days)
      const fromDate = subDays(new Date(), days);
      const recentActivity = await prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: fromDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      // Get daily verification trends for the last N days (using overallStatus via raw SQL)
      const today = startOfDay(new Date());
      const dailyTrends = await Promise.all(
        Array.from({ length: days }, (_, i) => {
          const day = subDays(today, days - 1 - i);
          const nextDay = subDays(today, days - 2 - i);
          return prisma.$queryRaw<{
            overallStatus: SubmissionStatus;
            count: bigint;
          }[]>`
            SELECT "overallStatus", COUNT(*) as count
            FROM "StudentProfile"
            WHERE "createdAt" >= ${day} AND "createdAt" < ${nextDay}
            GROUP BY "overallStatus"
          `.then(results => ({
            date: formatISO(day, { representation: 'date' }),
            submissions: results.reduce((sum, r) => sum + Number(r.count), 0),
            approved: results.find(r => r.overallStatus === SubmissionStatus.APPROVED)?.count ? Number(results.find(r => r.overallStatus === SubmissionStatus.APPROVED)?.count) : 0,
            rejected: results.find(r => r.overallStatus === SubmissionStatus.REJECTED)?.count ? Number(results.find(r => r.overallStatus === SubmissionStatus.REJECTED)?.count) : 0,
            pending: results.find(r => r.overallStatus === SubmissionStatus.PENDING)?.count ? Number(results.find(r => r.overallStatus === SubmissionStatus.PENDING)?.count) : 0,
            not_submitted: results.find(r => r.overallStatus === SubmissionStatus.NOT_SUBMITTED)?.count ? Number(results.find(r => r.overallStatus === SubmissionStatus.NOT_SUBMITTED)?.count) : 0,
          }));
        })
      );

      // Get average processing time for each document type (program) (using overallStatus via raw SQL)
      // (Assumes createdAt = submission, updatedAt = approval/rejection)
      const programs = await prisma.studentProfile.findMany({
        select: { program: true },
        distinct: ['program']
      });
      const processingTimes = await Promise.all(
        programs.map(async ({ program }) => {
          const approvedTimes: { createdAt: Date; updatedAt: Date }[] = await prisma.$queryRaw`
            SELECT "createdAt", "updatedAt"
            FROM "StudentProfile"
            WHERE "program" = ${program} AND "overallStatus" = ${SubmissionStatus.APPROVED}::"SubmissionStatus"
            AND "updatedAt" IS NOT NULL AND "createdAt" IS NOT NULL
          `;
          const times = approvedTimes
            .map(r => (r.updatedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            .filter(days => days >= 0);
          const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : null;
          return { program, avgProcessingDays: avg };
        })
      );

      // Get active verifiers (unique admins/faculty who approved/rejected in last N days)
      const activeVerifiers = await prisma.auditLog.findMany({
        where: {
          action: { in: ["VERIFICATION_APPROVED", "VERIFICATION_REJECTED"] },
          createdAt: { gte: fromDate }
        },
        select: { userId: true },
        distinct: ['userId']
      });

      // Format verification stats to include all possible statuses from the enum
      const allStatuses = Object.values(SubmissionStatus);
      const formattedVerificationStats = allStatuses.reduce((acc, status) => {
        const stat = verificationStats.find(s => s.overallStatus === status);
        acc[status] = stat ? Number(stat.count) : 0;
        return acc;
      }, {} as Record<SubmissionStatus, number>);

      return apiResponse({
        userStats: userStats.reduce((acc, curr) => ({ ...acc, [curr.role]: curr._count }), {}),
        verificationStats: formattedVerificationStats,
        departmentStats: departmentStats.reduce((acc, curr) => ({ ...acc, [curr.department]: curr._count }), {}),
        documentTypes: documentTypes.map(d => ({ type: d.program, count: d._count })),
        recentActivity,
        dailyTrends,
        processingTimes,
        activeVerifiers: activeVerifiers.length
      });
    }

    return apiResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler); 