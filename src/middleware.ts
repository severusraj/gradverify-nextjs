import { NextResponse, NextRequest } from "next/server";
import { checkAuth } from "./lib/check-auth";

const PROTECTED_ROUTES = [
	"/dashboard",
	"/dashboard/profile",
	"/dashboard/account",
];
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isAuthenticated = checkAuth(request);

	if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
		if (!isAuthenticated) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	}

	if (AUTH_ROUTES.includes(pathname)) {
		if (isAuthenticated) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path", "/login", "/register"],
};
