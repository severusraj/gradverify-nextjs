import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-middleware";
import { prisma } from "@/db/prisma";
import { format } from "date-fns";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";

interface SubmissionStatus {
  overallStatus: string;
  _count: number;
}

interface SubmissionMonth {
  createdAt: Date;
  _count: number;
}

interface DocumentStats {
  psaSubmitted: number;
  awardsSubmitted: number;
  gradPhotoSubmitted: number;
}

interface ReportData {
  totalSubmissions: number;
  submissionsByStatus: SubmissionStatus[];
  submissionsByMonth: SubmissionMonth[];
  avgVerificationTime: number;
  documentStats: DocumentStats;
}

interface FormattedReport {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'monthly'; // Default to monthly
    const formatType = searchParams.get('format');

    // Set date range based on period
    let dateFilter = {};
    const now = new Date();
    let startDate;

    switch (period) {
      case "daily":
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "monthly":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "quarterly":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "yearly":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 6)); // Default last 6 months
        break;
    }

    if (period !== 'all') { // 'all' period means no date filter
      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: new Date(),
        },
      };
    }

    // Get total submissions count
    const totalSubmissions = await prisma.studentProfile.count();

    // Get submissions by status
    const submissionsByStatus = await prisma.studentProfile.groupBy({
      by: ['overallStatus'],
      _count: true,
      where: dateFilter,
    });

    // Get submissions by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const submissionsByMonth = await prisma.studentProfile.groupBy({
      by: ['createdAt'],
      where: {
        ...dateFilter,
        createdAt: { gte: sixMonthsAgo }
      },
      _count: true,
    });

    // Get average verification time (time between submission and approval)
    const approvedSubmissions = await prisma.studentProfile.findMany({
      where: {
        ...dateFilter,
        overallStatus: 'APPROVED',
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    const avgVerificationTime = approvedSubmissions.reduce((acc: number, submission) => {
      const verificationTime = submission.updatedAt.getTime() - submission.createdAt.getTime();
      return acc + verificationTime;
    }, 0) / (approvedSubmissions.length || 1);

    // Get document type statistics
    const documentStats = {
      psaSubmitted: await prisma.studentProfile.count({
        where: {
          ...dateFilter,
          psaS3Key: { not: "" },
        },
      }),
      awardsSubmitted: await prisma.studentProfile.count({
        where: {
          ...dateFilter,
          awardsS3Key: { not: null },
        },
      }),
      gradPhotoSubmitted: await prisma.studentProfile.count({
        where: {
          ...dateFilter,
          gradPhotoS3Key: { not: "" },
        },
      }),
    };

    const reportData: ReportData = {
      totalSubmissions,
      submissionsByStatus,
      submissionsByMonth,
      avgVerificationTime,
      documentStats,
    };

    if (formatType) {
      // Generate and return file based on format
      const formattedReport = await generateFormattedReport(reportData, period, formatType);
      return new NextResponse(formattedReport.buffer, {
        headers: {
          'Content-Type': formattedReport.contentType,
          'Content-Disposition': `attachment; filename="${formattedReport.filename}"`,
        },
      });
    } else {
      // Return JSON data for display
      return NextResponse.json(reportData);
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
});

async function generateFormattedReport(
  data: ReportData,
  period: string,
  formatType: string
): Promise<FormattedReport> {
  const timestamp = format(new Date(), 'yyyyMMdd');
  const filename = `admin_report_${period}_${timestamp}`;

  switch (formatType) {
    case 'csv':
      return generateCSV(data, filename);
    case 'excel':
      return generateExcel(data, filename);
    case 'pdf':
      return generatePDF(data, filename);
    default:
      throw new Error('Unsupported format');
  }
}

async function generateCSV(data: ReportData, filename: string): Promise<FormattedReport> {
  let csvData: any[] = [];
  let fields: string[] = [];

  // Add summary data
  csvData.push({ Information: 'Total Submissions', Value: data.totalSubmissions });
  csvData.push({ Information: 'Average Verification Time (hours)', Value: Math.round(data.avgVerificationTime / (1000 * 60 * 60)) });
  csvData.push({ Information: 'Total Document Submissions', Value: data.documentStats.psaSubmitted + data.documentStats.awardsSubmitted + data.documentStats.gradPhotoSubmitted });
  csvData.push({}); // Add empty row for spacing

  // Add submissions by status
  csvData.push({ Information: 'Submissions by Status' });
  csvData.push({ Information: 'Status', Value: 'Count' });
  data.submissionsByStatus.forEach((item: SubmissionStatus) => {
    csvData.push({ Information: item.overallStatus, Value: item._count });
  });
  csvData.push({}); // Add empty row for spacing

  // Add submissions by month
    csvData.push({ Information: 'Submissions by Month' });
    csvData.push({ Information: 'Month/Year', Value: 'Count' });
    data.submissionsByMonth.forEach((item: SubmissionMonth) => {
        csvData.push({ Information: format(new Date(item.createdAt), 'MMM yyyy'), Value: item._count });
    });
  csvData.push({}); // Add empty row for spacing

  // Add document type statistics
  csvData.push({ Information: 'Document Type Statistics' });
  csvData.push({ Information: 'Document Type', Value: 'Count' });
  csvData.push({ Information: 'PSA Certificate Submitted', Value: data.documentStats.psaSubmitted });
  csvData.push({ Information: 'Award Certificate Submitted', Value: data.documentStats.awardsSubmitted });
  csvData.push({ Information: 'Graduation Photo Submitted', Value: data.documentStats.gradPhotoSubmitted });

  fields = ['Information', 'Value'];

  const parser = new Parser({ fields });
  const csv = parser.parse(csvData);

  return {
    buffer: Buffer.from(csv),
    contentType: 'text/csv',
    filename: `${filename}.csv`,
  };
}

async function generateExcel(data: ReportData, filename: string): Promise<FormattedReport> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Admin Report');

  // Add summary data
  worksheet.addRow(['Total Submissions', data.totalSubmissions]);
  worksheet.addRow(['Average Verification Time (hours)', Math.round(data.avgVerificationTime / (1000 * 60 * 60))]);
  worksheet.addRow(['Total Document Submissions', data.documentStats.psaSubmitted + data.documentStats.awardsSubmitted + data.documentStats.gradPhotoSubmitted]);
  worksheet.addRow([]); // Add empty row for spacing

  // Add submissions by status
  worksheet.addRow(['Submissions by Status']);
  worksheet.addRow(['Status', 'Count']);
  data.submissionsByStatus.forEach((item: SubmissionStatus) => {
    worksheet.addRow([item.overallStatus, item._count]);
  });
  worksheet.addRow([]); // Add empty row for spacing

  // Add submissions by month
    worksheet.addRow(['Submissions by Month']);
    worksheet.addRow(['Month/Year', 'Count']);
    data.submissionsByMonth.forEach((item: SubmissionMonth) => {
        worksheet.addRow([format(new Date(item.createdAt), 'MMM yyyy'), item._count]);
    });
  worksheet.addRow([]); // Add empty row for spacing

  // Add document type statistics
  worksheet.addRow(['Document Type Statistics']);
  worksheet.addRow(['Document Type', 'Count']);
  worksheet.addRow(['PSA Certificate Submitted', data.documentStats.psaSubmitted]);
  worksheet.addRow(['Award Certificate Submitted', data.documentStats.awardsSubmitted]);
  worksheet.addRow(['Graduation Photo Submitted', data.documentStats.gradPhotoSubmitted]);

  const buffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(buffer),
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filename: `${filename}.xlsx`,
  };
}

async function generatePDF(data: ReportData, filename: string): Promise<FormattedReport> {
  const doc = new jsPDF();
  let yPos = 10;
  const lineHeight = 7;
  const margin = 10;

  doc.setFontSize(18);
  doc.text('Admin Report', margin, yPos);
  yPos += lineHeight * 2;

  // Add summary data
  doc.setFontSize(12);
  doc.text(`Total Submissions: ${data.totalSubmissions}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Average Verification Time (hours): ${Math.round(data.avgVerificationTime / (1000 * 60 * 60))}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Total Document Submissions: ${data.documentStats.psaSubmitted + data.documentStats.awardsSubmitted + data.documentStats.gradPhotoSubmitted}`, margin, yPos);
  yPos += lineHeight * 2;

  // Add submissions by status
  doc.setFontSize(14);
  doc.text('Submissions by Status', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(10);
  data.submissionsByStatus.forEach((item: SubmissionStatus) => {
    doc.text(`${item.overallStatus}: ${item._count}`, margin, yPos);
    yPos += lineHeight;
  });
  yPos += lineHeight;

  // Add submissions by month
  doc.setFontSize(14);
  doc.text('Submissions by Month', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(10);
  data.submissionsByMonth.forEach((item: SubmissionMonth) => {
    doc.text(`${format(new Date(item.createdAt), 'MMM yyyy')}: ${item._count}`, margin, yPos);
    yPos += lineHeight;
  });
  yPos += lineHeight;

  // Add document type statistics
  doc.setFontSize(14);
  doc.text('Document Type Statistics', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(10);
  doc.text(`PSA Certificate Submitted: ${data.documentStats.psaSubmitted}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Award Certificate Submitted: ${data.documentStats.awardsSubmitted}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Graduation Photo Submitted: ${data.documentStats.gradPhotoSubmitted}`, margin, yPos);

  const buffer = Buffer.from(doc.output('arraybuffer'));
  return {
    buffer,
    contentType: 'application/pdf',
    filename: `${filename}.pdf`,
  };
} 