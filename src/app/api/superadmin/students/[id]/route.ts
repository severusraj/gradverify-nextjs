import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Validation schema for request body
const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

async function handler(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  try {
    const { id } = context.params;

    // Verify student profile exists
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      return apiResponse({ error: "Student profile not found" }, 404);
    }

    if (req.method === "GET") {
      return apiResponse({ student });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const validation = updateSchema.safeParse(body);
      
      if (!validation.success) {
        return apiResponse({ error: "Invalid request body" }, 400);
      }

      const { status, rejectionReason } = validation.data;

      // Update student profile
      const updatedStudent = await prisma.studentProfile.update({
        where: { id },
        data: {
          status,
          ...(rejectionReason && { rejectionReason }),
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

      return apiResponse({ student: updatedStudent });
    }

    return apiResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler);
export const PUT = withSuperAdmin(handler); 