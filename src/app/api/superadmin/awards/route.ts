import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

export const runtime = "nodejs";

// Validation schema for award creation/update
const awardSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(2).max(50),
  year: z.string().regex(/^\d{4}$/),
  studentId: z.string(),
});

async function handler(req: NextRequest) {
  try {
    if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get("category");
      const year = searchParams.get("year");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");

      // Build where clause
      const where: any = {};
      if (category && category !== "all") {
        where.category = category;
      }
      if (year && year !== "all") {
        where.year = year;
      }

      // Get total count for pagination
      const total = await prisma.award.count({ where });

      // Get paginated awards
      const awards = await prisma.award.findMany({
        where,
        include: {
          student: {
            select: {
              name: true,
              email: true,
              studentProfile: {
                select: {
                  department: true,
                  program: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return apiResponse({
        awards,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
          limit,
        },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const validation = awardSchema.safeParse(body);

      if (!validation.success) {
        return apiResponse({ 
          error: "Invalid request data", 
          details: validation.error.format() 
        }, 400);
      }

      const { name, description, category, year, studentId } = validation.data;

      // Verify student exists
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: { studentProfile: true },
      });

      if (!student || !student.studentProfile) {
        return apiResponse({ error: "Student not found" }, 404);
      }

      // Create award
      const award = await prisma.award.create({
        data: {
          name,
          description,
          category,
          year,
          studentId,
        },
        include: {
          student: {
            select: {
              name: true,
              email: true,
              studentProfile: {
                select: {
                  department: true,
                  program: true,
                },
              },
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: "AWARD_CREATED",
          userId: req.headers.get("x-user-id") || "system",
          targetId: award.id,
          details: {
            awardId: award.id,
            studentId,
            category,
            year,
          },
        },
      });

      return apiResponse({ award }, 201);
    }

    return apiResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler);
export const POST = withSuperAdmin(handler); 