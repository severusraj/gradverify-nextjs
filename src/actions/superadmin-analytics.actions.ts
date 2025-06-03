"use server";

import { prisma } from "@/db/prisma";
import { subDays, formatISO, startOfDay } from "date-fns";

export async function getSuperadminAnalytics(range: "7days" | "30days" | "90days" = "30days") {
  let days = 30;
  if (range === "7days") days = 7;
  if (range === "90days") days = 90;

  // Get total users by role
  const userStats = await prisma.user.groupBy({ by: ["role"], _count: true });

  // Get verification status counts
  const verificationStats = await prisma.$queryRaw<{
    overallStatus: string;
    count: bigint;
  }[]>`
    SELECT "overallStatus", COUNT(*) as count
    FROM "StudentProfile"
    GROUP BY "overallStatus"
  `;

  // Get department distribution
  const departmentStats = await prisma.studentProfile.groupBy({ by: ["department"], _count: true });

  // Get document types distribution (by program)
  const documentTypes = await prisma.studentProfile.groupBy({ by: ["program"], _count: true });

  // Get recent activity (last N days)
  const fromDate = subDays(new Date(), days);
  const recentActivity = await prisma.auditLog.findMany({
    where: { createdAt: { gte: fromDate } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  // Get daily verification trends for the last N days
  const today = startOfDay(new Date());
  const dailyTrends = await Promise.all(
    Array.from({ length: days }, (_, i) => {
      const day = subDays(today, days - 1 - i);
      const nextDay = subDays(today, days - 2 - i);
      return prisma.$queryRaw<{
        overallStatus: string;
        count: bigint;
      }[]>`
        SELECT "overallStatus", COUNT(*) as count
        FROM "StudentProfile"
        WHERE "createdAt" >= ${day} AND "createdAt" < ${nextDay}
        GROUP BY "overallStatus"
      `.then((results: any[]) => ({
        date: formatISO(day, { representation: "date" }),
        submissions: results.reduce((sum: number, r: any) => sum + Number(r.count), 0),
        approved: results.find((r: any) => r.overallStatus === "APPROVED")?.count ? Number(results.find((r: any) => r.overallStatus === "APPROVED")?.count) : 0,
        rejected: results.find((r: any) => r.overallStatus === "REJECTED")?.count ? Number(results.find((r: any) => r.overallStatus === "REJECTED")?.count) : 0,
        pending: results.find((r: any) => r.overallStatus === "PENDING")?.count ? Number(results.find((r: any) => r.overallStatus === "PENDING")?.count) : 0,
        not_submitted: results.find((r: any) => r.overallStatus === "NOT_SUBMITTED")?.count ? Number(results.find((r: any) => r.overallStatus === "NOT_SUBMITTED")?.count) : 0,
      }));
    })
  );

  // Get average processing time for each document type (program)
  const programs = await prisma.studentProfile.findMany({ select: { program: true }, distinct: ["program"] });
  const processingTimes = await Promise.all(
    programs.map(async ({ program }: any) => {
      const approvedTimes: { createdAt: Date; updatedAt: Date }[] = await prisma.$queryRaw`
        SELECT "createdAt", "updatedAt"
        FROM "StudentProfile"
        WHERE "program" = ${program} AND "overallStatus" = ${"APPROVED"}::"SubmissionStatus"
        AND "updatedAt" IS NOT NULL AND "createdAt" IS NOT NULL
      `;
      const times = approvedTimes
        .map(r => (r.updatedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        .filter(days => days >= 0);
      const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
      return { program, avgProcessingDays: avg };
    })
  );

  // Get active verifiers (unique admins/faculty who approved/rejected in last N days)
  const activeVerifiers = await prisma.auditLog.findMany({
    where: {
      action: { in: ["VERIFICATION_APPROVED", "VERIFICATION_REJECTED"] },
      createdAt: { gte: fromDate },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  // Format verification stats to include all possible statuses
  const allStatuses = ["APPROVED", "REJECTED", "PENDING", "NOT_SUBMITTED"];
  const formattedVerificationStats = allStatuses.reduce((acc, status) => {
    const stat = verificationStats.find((s: any) => s.overallStatus === status);
    acc[status] = stat ? Number(stat.count) : 0;
    return acc;
  }, {} as Record<string, number>);

  return {
    userStats: userStats.reduce((acc: any, curr: any) => ({ ...acc, [curr.role]: curr._count }), {}),
    verificationStats: formattedVerificationStats,
    departmentStats: departmentStats.reduce((acc: any, curr: any) => ({ ...acc, [curr.department]: curr._count }), {}),
    documentTypes: documentTypes.map((d: any) => ({ type: d.program, count: d._count })),
    recentActivity,
    dailyTrends,
    processingTimes,
    activeVerifiers: activeVerifiers.length,
  };
} 