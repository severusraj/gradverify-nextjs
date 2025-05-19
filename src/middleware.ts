import { NextResponse, NextRequest } from "next/server";
import { getSessionUser, type AuthPayload } from "./lib/auth";

const roleRoutes = {
	"/dashboard/superadmin": "SUPER_ADMIN",
	"/dashboard/admin": "ADMIN",
	"/dashboard/faculty": "FACULTY",
	"/dashboard/student": "STUDENT",
} as const;

const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const user = await getSessionUser<AuthPayload>();
	const isAuthenticated = !!user;

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
