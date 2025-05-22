import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Validation schema for bulk update
const bulkUpdateSchema = z.object({
  studentIds: z.array(z.string()),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

async function handler(req: NextRequest) {
  try {
    if (req.method === "PUT") {
      const body = await req.json();
      const validation = bulkUpdateSchema.safeParse(body);
      
      if (!validation.success) {
        return apiResponse({ error: "Invalid request data" }, 400);
      }

      const { studentIds, status, rejectionReason } = validation.data;

      // Update all specified student profiles
      const updatedStudents = await prisma.studentProfile.updateMany({
        where: {
          id: {
            in: studentIds
          }
        },
        data: {
          status,
          ...(rejectionReason && { rejectionReason }),
        }
      });

      return apiResponse({
        message: `Updated ${updatedStudents.count} student profiles`,
        count: updatedStudents.count
      });
    }

    return apiResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    return handleApiError(error);
  }
}

export const PUT = withSuperAdmin(handler); 