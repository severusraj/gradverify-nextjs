import { NextRequest } from "next/server";

export const REQUEST_COOKIES_NAME = "session_token";

export function checkAuth(request: NextRequest) {
	const token = request.cookies.get(REQUEST_COOKIES_NAME)?.value;
	return !!token;
}
