import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/current-user";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
});

async function handler(req: NextRequest) {
  try {
    // Only allow PUT
    if (req.method !== "PUT") {
      return apiResponse({ error: "Method not allowed" }, 405);
    }
    const user = await getCurrentUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);
    const body = await req.json();
    const validation = profileSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse({ error: "Invalid request data", details: validation.error.format() }, 400);
    }
    const { name, email } = validation.data;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true }
    });
    return apiResponse({ user: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}

export const PUT = withSuperAdmin(handler); 