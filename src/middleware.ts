import { NextResponse, NextRequest } from "next/server";
import { getSessionUserWithStatus, type AuthPayload } from "@/lib/auth/auth-edge";
import { SESSION_TOKEN } from "@/lib/utils/constants";

const roleRoutes = {
	"/dashboard/superadmin": "SUPER_ADMIN",
	"/dashboard/admin": "ADMIN",
	"/dashboard/faculty": "FACULTY",
	"/dashboard/student": "STUDENT",
} as const;

const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const { user, invalidToken } = await getSessionUserWithStatus<AuthPayload>();
	const isAuthenticated = !!user;

	// Force logout on invalid token
	if (invalidToken) {
		const response = NextResponse.redirect(new URL("/login", request.url));
		response.cookies.delete(SESSION_TOKEN);
		return response;
	}

	if (authRoutes.includes(pathname)) {
		if (isAuthenticated) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
		return NextResponse.next();
	}

	if (pathname.startsWith("/dashboard")) {
		if (!isAuthenticated) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		for (const [routePrefix, requiredRole] of Object.entries(roleRoutes)) {
			if (pathname.startsWith(routePrefix)) {
				if (user.role !== requiredRole) {
					return NextResponse.redirect(new URL("/dashboard", request.url));
				}
				break;
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/login", "/register"],
};
