import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const department = searchParams.get("department") || "";
    const award = searchParams.get("award") || "";

    // Build where clause
    const where: any = {};
    if (role && role !== "All") {
      where.role = role === "Graduate" ? "STUDENT" : role.toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Properly merge department and award filters
    if ((department && department !== "All") || (award && award !== "All")) {
      where.studentProfile = { is: {} };
      if (department && department !== "All") {
        where.studentProfile.is.department = { contains: department, mode: "insensitive" };
      }
      if (award && award !== "All") {
        where.studentProfile.is.awardsS3Key = { not: null };
      }
    }

    // Count total
    const total = await prisma.user.count({ where });

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentProfile: {
          select: {
            department: true,
            awardsS3Key: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Map to frontend format
    const recipients = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: "Graduating Student",
      department: u.studentProfile?.department || "",
      award: u.studentProfile?.awardsS3Key ? "Awardee" : "",
    }));

    return apiResponse({
      recipients,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler); 