import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";
import { getCurrentUser } from "@/lib/current-user";
import { z } from "zod";

const passwordSchema = z.object({
  current: z.string().min(8),
  new: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirm: z.string().min(8),
});

async function handler(req: NextRequest) {
  try {
    if (req.method !== "PUT") {
      return apiResponse({ error: "Method not allowed" }, 405);
    }
    const user = await getCurrentUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);
    const body = await req.json();
    const validation = passwordSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse({ error: "Invalid request data", details: validation.error.format() }, 400);
    }
    const { current, new: newPassword, confirm } = validation.data;
    if (newPassword !== confirm) {
      return apiResponse({ error: "Passwords do not match" }, 400);
    }
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return apiResponse({ error: "User not found" }, 404);
    const valid = await verifyPassword(current, dbUser.password);
    if (!valid) return apiResponse({ error: "Current password is incorrect" }, 400);
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return apiResponse({ message: "Password updated successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

export const PUT = withSuperAdmin(handler); 