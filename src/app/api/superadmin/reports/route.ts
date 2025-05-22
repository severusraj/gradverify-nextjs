import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";

// Validation schema for query parameters
const querySchema = z.object({
  type: z.enum(["verification", "department", "awards", "analytics"]).optional(),
  period: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(),
  format: z.enum(["pdf", "excel", "csv"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validation = querySchema.safeParse(query);
    if (!validation.success) {
      return apiResponse({ error: "Invalid query parameters" }, 400);
    }
    
    const { type, period, format, startDate, endDate } = validation.data;

    // Set date range based on period
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = {
        createdAt: {
          gte: startOfDay(new Date(startDate)),
          lte: endOfDay(new Date(endDate)),
        },
      };
    } else if (period) {
      const now = new Date();
      let start;
      switch (period) {
        case "daily":
          start = subDays(now, 1);
          break;
        case "weekly":
          start = subDays(now, 7);
          break;
        case "monthly":
          start = subDays(now, 30);
          break;
        case "quarterly":
          start = subDays(now, 90);
          break;
        case "yearly":
          start = subDays(now, 365);
          break;
      }
      dateRange = {
        createdAt: {
          gte: startOfDay(start),
          lte: endOfDay(now),
        },
      };
    }

    // Generate report based on type
    let reportData;
    switch (type) {
      case "verification":
        reportData = await generateVerificationReport(dateRange);
        break;
      case "department":
        reportData = await generateDepartmentReport(dateRange);
        break;
      case "awards":
        reportData = await generateAwardsReport(dateRange);
        break;
      case "analytics":
        reportData = await generateAnalyticsReport(dateRange);
        break;
      default:
        // Return recent reports if no type specified
        reportData = await getRecentReports();
    }

    // If format is specified, generate the report in the requested format
    if (format && type && period) {
      const report = await generateFormattedReport(reportData, type, format, period);
      return new NextResponse(report.buffer, {
        headers: {
          'Content-Type': report.contentType,
          'Content-Disposition': `attachment; filename="${report.filename}"`,
        },
      });
    }

    return apiResponse(reportData);
  } catch (error) {
    return handleApiError(error);
  }
}

async function generateVerificationReport(dateRange: any) {
  const [verificationStats, processingTimes, documentTypes] = await Promise.all([
    // Verification status counts
    prisma.studentProfile.groupBy({
      by: ['overallStatus'],
      _count: true,
      where: dateRange,
    }),
    
    // Processing times
    prisma.studentProfile.findMany({
      where: {
        ...dateRange,
        overallStatus: { in: ["APPROVED", "REJECTED"] },
      },
      select: {
        createdAt: true,
        updatedAt: true,
        program: true,
      },
    }),
    
    // Document types
    prisma.studentProfile.groupBy({
      by: ['program'],
      _count: true,
      where: dateRange,
    }),
  ]);

  // Calculate average processing time by program
  const processingTimeByProgram = processingTimes.reduce((acc: any, curr) => {
    const program = curr.program;
    const processingTime = (curr.updatedAt.getTime() - curr.createdAt.getTime()) / (1000 * 60 * 60 * 24); // in days
    
    if (!acc[program]) {
      acc[program] = { total: 0, count: 0 };
    }
    acc[program].total += processingTime;
    acc[program].count += 1;
    
    return acc;
  }, {});

  const avgProcessingTimes = Object.entries(processingTimeByProgram).map(([program, data]: [string, any]) => ({
    program,
    avgProcessingDays: data.total / data.count,
  }));

  return {
    verificationStats,
    avgProcessingTimes,
    documentTypes,
  };
}

async function generateDepartmentReport(dateRange: any) {
  const [departmentStats, programStats, studentCounts] = await Promise.all([
    // Department statistics
    prisma.studentProfile.groupBy({
      by: ['department'],
      _count: true,
      where: dateRange,
    }),
    
    // Program statistics
    prisma.studentProfile.groupBy({
      by: ['program'],
      _count: true,
      where: dateRange,
    }),
    
    // Student counts by status
    prisma.studentProfile.groupBy({
      by: ['department', 'overallStatus'],
      _count: true,
      where: dateRange,
    }),
  ]);

  return {
    departmentStats,
    programStats,
    studentCounts,
  };
}

async function generateAwardsReport(dateRange: any) {
  const [awardStats, departmentAwards, recentAwards] = await Promise.all([
    // Award statistics
    prisma.studentProfile.groupBy({
      by: ['overallStatus'],
      _count: true,
      where: {
        ...dateRange,
        awardsS3Key: { not: null },
      },
    }),
    
    // Awards by department
    prisma.studentProfile.groupBy({
      by: ['department'],
      _count: true,
      where: {
        ...dateRange,
        awardsS3Key: { not: null },
      },
    }),
    
    // Recent awards
    prisma.studentProfile.findMany({
      where: {
        ...dateRange,
        awardsS3Key: { not: null },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    }),
  ]);

  return {
    awardStats,
    departmentAwards,
    recentAwards,
  };
}

async function generateAnalyticsReport(dateRange: any) {
  const [userStats, verificationStats, departmentStats, recentActivity] = await Promise.all([
    // User statistics
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    
    // Verification statistics
    prisma.studentProfile.groupBy({
      by: ['overallStatus'],
      _count: true,
      where: dateRange,
    }),
    
    // Department statistics
    prisma.studentProfile.groupBy({
      by: ['department'],
      _count: true,
      where: dateRange,
    }),
    
    // Recent activity
    prisma.auditLog.findMany({
      where: dateRange,
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    userStats,
    verificationStats,
    departmentStats,
    recentActivity,
  };
}

async function getRecentReports() {
  // Get recent verification requests
  const recentVerifications = await prisma.studentProfile.findMany({
    take: 5,
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Get recent awards
  const recentAwards = await prisma.studentProfile.findMany({
    where: {
      awardsS3Key: { not: null },
    },
    take: 5,
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    recentVerifications,
    recentAwards,
  };
}

interface FormattedReport {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

async function generateFormattedReport(
  data: any,
  type: string,
  format: string,
  period: string
): Promise<FormattedReport> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${type}_report_${period}_${timestamp}`;

  switch (format) {
    case 'csv':
      return generateCSV(data, type, filename);
    case 'excel':
      return generateExcel(data, type, filename);
    case 'pdf':
      return generatePDF(data, type, filename);
    default:
      throw new Error('Unsupported format');
  }
}

async function generateCSV(data: any, type: string, filename: string) {
  let fields: string[] = [];
  let csvData: any[] = [];

  switch (type) {
    case 'verification':
      fields = ['Status', 'Count'];
      csvData = data.verificationStats.map((stat: any) => ({
        Status: stat.status,
        Count: stat._count,
      }));
      break;
    case 'department':
      fields = ['Department', 'Count'];
      csvData = data.departmentStats.map((stat: any) => ({
        Department: stat.department,
        Count: stat._count,
      }));
      break;
    case 'awards':
      fields = ['Status', 'Count'];
      csvData = data.awardStats.map((stat: any) => ({
        Status: stat.status,
        Count: stat._count,
      }));
      break;
    case 'analytics':
      fields = ['Role', 'Count'];
      csvData = data.userStats.map((stat: any) => ({
        Role: stat.role,
        Count: stat._count,
      }));
      break;
  }

  const parser = new Parser({ fields });
  const csv = parser.parse(csvData);

  return {
    buffer: Buffer.from(csv),
    contentType: 'text/csv',
    filename: `${filename}.csv`,
  };
}

async function generateExcel(data: any, type: string, filename: string): Promise<FormattedReport> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  switch (type) {
    case 'verification':
      worksheet.columns = [
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Count', key: 'count', width: 15 },
      ];
      data.verificationStats.forEach((stat: any) => {
        worksheet.addRow({ status: stat.status, count: stat._count });
      });
      break;
    case 'department':
      worksheet.columns = [
        { header: 'Department', key: 'department', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
      ];
      data.departmentStats.forEach((stat: any) => {
        worksheet.addRow({ department: stat.department, count: stat._count });
      });
      break;
    case 'awards':
      worksheet.columns = [
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Count', key: 'count', width: 15 },
      ];
      data.awardStats.forEach((stat: any) => {
        worksheet.addRow({ status: stat.status, count: stat._count });
      });
      break;
    case 'analytics':
      worksheet.columns = [
        { header: 'Role', key: 'role', width: 20 },
        { header: 'Count', key: 'count', width: 15 },
      ];
      data.userStats.forEach((stat: any) => {
        worksheet.addRow({ role: stat.role, count: stat._count });
      });
      break;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(buffer),
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filename: `${filename}.xlsx`,
  };
}

async function generatePDF(data: any, type: string, filename: string): Promise<FormattedReport> {
  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 10;
  const margin = 20;

  // Add title
  doc.setFontSize(20);
  doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, margin, yPos);
  yPos += lineHeight * 2;

  // Add content based on type
  doc.setFontSize(16);
  switch (type) {
    case 'verification':
      doc.text('Verification Status', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(12);
      data.verificationStats.forEach((stat: any) => {
        doc.text(`${stat.status}: ${stat._count}`, margin, yPos);
        yPos += lineHeight;
      });
      break;
    case 'department':
      doc.text('Department Statistics', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(12);
      data.departmentStats.forEach((stat: any) => {
        doc.text(`${stat.department}: ${stat._count}`, margin, yPos);
        yPos += lineHeight;
      });
      break;
    case 'awards':
      doc.text('Award Statistics', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(12);
      data.awardStats.forEach((stat: any) => {
        doc.text(`${stat.status}: ${stat._count}`, margin, yPos);
        yPos += lineHeight;
      });
      break;
    case 'analytics':
      doc.text('User Statistics', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(12);
      data.userStats.forEach((stat: any) => {
        doc.text(`${stat.role}: ${stat._count}`, margin, yPos);
        yPos += lineHeight;
      });
      break;
  }

  const buffer = Buffer.from(doc.output('arraybuffer'));
  return {
    buffer,
    contentType: 'application/pdf',
    filename: `${filename}.pdf`,
  };
}

export const GET = withSuperAdmin(handler); 