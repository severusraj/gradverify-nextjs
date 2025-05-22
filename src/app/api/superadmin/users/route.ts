import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth-utils";
import { z } from "zod";

// Validation schema for user creation/update
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  role: z.enum(["ADMIN", "FACULTY"]),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
});

async function handler(req: NextRequest) {
  try {
    if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = searchParams.get("search") || "";
      const department = searchParams.get("department") || "";

      // Build where clause
      const where: any = {
        role: { in: ["ADMIN", "FACULTY"] }
      };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ];
      }
      if (department) {
        where.department = department;
      }

      const total = await prisma.user.count({ where });
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          studentProfile: {
            select: {
              department: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });

      return apiResponse({
        users,
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
      const validation = userSchema.safeParse(body);
      
      if (!validation.success) {
        return apiResponse({ 
          error: "Invalid request data", 
          details: validation.error.format() 
        }, 400);
      }

      const { name, email, role, password } = validation.data;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return apiResponse({ error: "User already exists" }, 400);
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          role,
          password: hashedPassword,
          lastLoginAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      });

      return apiResponse({ user }, 201);
    }

    return apiResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler);
export const POST = withSuperAdmin(handler); 