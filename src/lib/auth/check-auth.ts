import { NextRequest } from "next/server";
import { SESSION_TOKEN } from "@/lib/utils/constants";

export function checkAuth(request: NextRequest) {
	const token = request.cookies.get(SESSION_TOKEN)?.value;
	return !!token;
}
