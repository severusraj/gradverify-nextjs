import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || "1")),
  limit: z.string().optional().transform(val => parseInt(val || "10")),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
  hasAwards: z.string().optional(),
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
    
    const { page = 1, limit = 10, status, search, hasAwards } = validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { studentId: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      }),
    };
    if (hasAwards === "true") {
      where.awardsS3Key = { not: null };
    }

    // Get total count for pagination
    const total = await prisma.studentProfile.count({ where });

    // Fetch student profiles with pagination
    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return apiResponse({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler); 