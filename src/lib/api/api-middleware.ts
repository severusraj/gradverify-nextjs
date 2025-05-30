import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/current-user";

// Define Role type to match Prisma schema
export type Role = "SUPER_ADMIN" | "ADMIN" | "FACULTY" | "STUDENT";

export type ApiHandler<T = unknown> =
  | ((req: NextRequest) => Promise<NextResponse>)
  | ((req: NextRequest, context: { params: T }) => Promise<NextResponse>);

export type RoleConfig = {
  allowedRoles: Role[];
  requireAuth?: boolean;
};

export function withApiAuth<T = unknown>(handler: ApiHandler<T>, config: RoleConfig) {
  return async (req: NextRequest, context: { params: T }) => {
    try {
      // Check authentication if required
      if (config.requireAuth !== false) {
        const user = await getCurrentUser();
        
        if (!user) {
          return NextResponse.json(
            { error: "Unauthorized - Authentication required" },
            { status: 401 }
          );
        }

        // Check role permissions
        if (config.allowedRoles.length > 0 && !config.allowedRoles.includes(user.role as Role)) {
          return NextResponse.json(
            { error: "Forbidden - Insufficient permissions" },
            { status: 403 }
          );
        }
      }

      if (handler.length === 2) {
        return await (handler as (req: NextRequest, context: { params: T }) => Promise<NextResponse>)(req, context);
      } else {
        return await (handler as (req: NextRequest) => Promise<NextResponse>)(req);
      }
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

// Helper function to create role-based API handlers
export function createRoleBasedHandler<T = unknown>(handler: ApiHandler<T>, roles: Role[]) {
  return withApiAuth(handler, {
    allowedRoles: roles,
    requireAuth: true,
  });
}

// Predefined role-based handlers
export const withSuperAdmin = <T = unknown>(handler: ApiHandler<T>) => 
  createRoleBasedHandler(handler, ["SUPER_ADMIN"]);

export const withAdmin = <T = unknown>(handler: ApiHandler<T>) => 
  createRoleBasedHandler(handler, ["SUPER_ADMIN", "ADMIN"]);

export const withFaculty = <T = unknown>(handler: ApiHandler<T>) => 
  createRoleBasedHandler(handler, ["SUPER_ADMIN", "ADMIN", "FACULTY"]); 