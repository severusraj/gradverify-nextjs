import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(req: NextRequest) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ user: null }, { status: 401 });
	return NextResponse.json({ user });
}
