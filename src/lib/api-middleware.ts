import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./current-user";

// Define Role type to match Prisma schema
export type Role = "SUPER_ADMIN" | "ADMIN" | "FACULTY" | "STUDENT";

export type ApiHandler = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

export type RoleConfig = {
  allowedRoles: Role[];
  requireAuth?: boolean;
};

export function withApiAuth(handler: ApiHandler, config: RoleConfig) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
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

      // Call the original handler
      return await handler(req, context);
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
export function createRoleBasedHandler(handler: ApiHandler, roles: Role[]) {
  return withApiAuth(handler, {
    allowedRoles: roles,
    requireAuth: true,
  });
}

// Predefined role-based handlers
export const withSuperAdmin = (handler: ApiHandler) => 
  createRoleBasedHandler(handler, ["SUPER_ADMIN"]);

export const withAdmin = (handler: ApiHandler) => 
  createRoleBasedHandler(handler, ["SUPER_ADMIN", "ADMIN"]);

export const withFaculty = (handler: ApiHandler) => 
  createRoleBasedHandler(handler, ["SUPER_ADMIN", "ADMIN", "FACULTY"]); 