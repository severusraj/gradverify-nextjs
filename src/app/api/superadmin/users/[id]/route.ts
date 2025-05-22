import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth-utils";
import { z } from "zod";

// Validation schema for user update
const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "FACULTY"]).optional(),
  password: z.string().min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    .optional(),
});

async function handler(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  try {
    const { id } = context.params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      }
    });

    if (!user) {
      return apiResponse({ error: "User not found" }, 404);
    }

    if (req.method === "GET") {
      return apiResponse({ user });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const validation = updateSchema.safeParse(body);
      
      if (!validation.success) {
        return apiResponse({ 
          error: "Invalid request data", 
          details: validation.error.format() 
        }, 400);
      }

      const { name, role, password } = validation.data;
      const updateData: any = {};

      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (password) {
        updateData.password = await hashPassword(password);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        }
      });

      return apiResponse({ user: updatedUser });
    }

    if (req.method === "DELETE") {
      // Prevent deleting the last superadmin
      if (user.role === "SUPER_ADMIN") {
        const superAdminCount = await prisma.user.count({
          where: { role: "SUPER_ADMIN" }
        });
        
        if (superAdminCount <= 1) {
          return apiResponse({ 
            error: "Cannot delete the last superadmin" 
          }, 400);
        }
      }

      // Delete user
      await prisma.user.delete({
        where: { id }
      });

      return apiResponse({ message: "User deleted successfully" });
    }

    return apiResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler);
export const PUT = withSuperAdmin(handler);
export const DELETE = withSuperAdmin(handler); 