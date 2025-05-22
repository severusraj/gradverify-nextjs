import { NextRequest } from "next/server";
import { withSuperAdmin } from "@/lib/middleware/with-superadmin";
import { apiResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";
import { getAuditLogs } from "@/lib/audit-logger";
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().optional(),
  targetId: z.string().optional(),
  action: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const GET = withSuperAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    
    const validatedQuery = querySchema.parse(query);
    
    const filters = {
      userId: validatedQuery.userId,
      targetId: validatedQuery.targetId,
      action: validatedQuery.action as any,
      startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
      endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
    };

    const page = validatedQuery.page ? parseInt(validatedQuery.page) : 1;
    const limit = validatedQuery.limit ? parseInt(validatedQuery.limit) : 10;

    const result = await getAuditLogs(filters, page, limit);

    return apiResponse({
      data: result,
      message: "Audit logs retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}); 