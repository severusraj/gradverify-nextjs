"use server";

import { prisma } from "@/db/prisma";
import { z } from "zod";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

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

export async function exportSuperadminReport({ type, period, formatType }: { type: string, period: string, formatType: string }) {
  const timestamp = format(new Date(), 'yyyyMMdd');
  const filename = `superadmin_report_${type}_${period}_${timestamp}`;
  const data = await getSuperadminReport({ type, period });

  if (formatType === 'csv') {
    // Simple CSV export example
    const csv = new Parser().parse(data);
    const buffer = Buffer.from(csv);
    return {
      base64: buffer.toString('base64'),
      contentType: 'text/csv',
      filename: `${filename}.csv`,
    };
  } else if (formatType === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    worksheet.addRow(Object.keys(data));
    worksheet.addRow(Object.values(data));
    const buffer = await workbook.xlsx.writeBuffer();
    return {
      base64: Buffer.from(buffer).toString('base64'),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `${filename}.xlsx`,
    };
  } else if (formatType === 'pdf') {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text(`Superadmin Report: ${type} (${period})`, 10, y);
    y += 10;

    if (type === 'awards' && data && 'awardStats' in data) {
      // Award Stats
      doc.setFontSize(12);
      doc.text("Award Stats:", 10, y);
      y += 8;
      (data.awardStats as Array<{ status: string; _count: number }>).forEach((stat) => {
        doc.text(`Status: ${stat.status}, Count: ${stat._count}`, 12, y);
        y += 6;
      });
      y += 4;

      // Department Awards
      doc.text("Department Awards:", 10, y);
      y += 8;
      (data.departmentAwards as Array<{ category: string; _count: number }>).forEach((dept) => {
        doc.text(`Category: ${dept.category}, Count: ${dept._count}`, 12, y);
        y += 6;
      });
      y += 4;

      // Recent Awards
      doc.text("Recent Awards:", 10, y);
      y += 8;
      (data.recentAwards as Array<any>).forEach((award: any, idx: number) => {
        doc.text(
          `${idx + 1}. ${award.name} (${award.status}) - ${award.student?.name ?? "Unknown"} - ${award.createdAt ? new Date(award.createdAt).toLocaleDateString() : ""}`,
          12,
          y
        );
        y += 6;
        if (y > 270) { doc.addPage(); y = 10; }
      });
    } else if (type === 'verification' && data && 'verificationStats' in data) {
      doc.setFontSize(12);
      doc.text("Verification Stats:", 10, y); y += 8;
      (data.verificationStats as any[]).forEach((stat) => {
        doc.text(`${stat.overallStatus ?? stat.status}: ${stat._count}`, 12, y);
        y += 6;
      });
      y += 4;
      if ('avgProcessingTimes' in data) {
        doc.text("Avg Processing Times (days):", 10, y); y += 8;
        (data.avgProcessingTimes as any[]).forEach((row:any)=>{
          doc.text(`${row.program}: ${row.avgProcessingDays.toFixed(1)}`, 12, y);
          y+=6;
        });
      }
    } else if (type === 'department' && data && 'departmentStats' in data) {
      doc.setFontSize(12);
      doc.text("Department Stats:", 10, y); y += 8;
      (data.departmentStats as any[]).forEach((stat)=>{
         doc.text(`${stat.department}: ${stat._count}`, 12, y); y +=6;
      });
      y+=4;
      if ('programStats' in data) {
        doc.text("Program Stats:",10,y); y+=8;
        (data.programStats as any[]).forEach((stat)=>{ doc.text(`${stat.program}: ${stat._count}`, 12, y); y+=6; });
      }
    } else if (type === 'analytics' && data && 'userStats' in data) {
      doc.setFontSize(12);
      doc.text("User Stats:",10,y); y+=8;
      (data.userStats as any[]).forEach((stat)=>{ doc.text(`${stat.role}: ${stat._count}`, 12, y); y+=6; });
    } else {
      doc.setFontSize(12);
      doc.text("No data available for this report type.", 10, y);
    }

    const pdfBuffer = doc.output('arraybuffer');
    return {
      base64: Buffer.from(pdfBuffer).toString('base64'),
      contentType: 'application/pdf',
      filename: `${filename}.pdf`,
    };
  }
  return { base64: '', contentType: '', filename: '' };
} 