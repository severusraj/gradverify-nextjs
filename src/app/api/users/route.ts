import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";

async function handler(req: NextRequest) {
  try {
    // Fetch all admin and faculty users
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "FACULTY"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return apiResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler); 