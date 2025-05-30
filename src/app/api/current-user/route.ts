import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/current-user";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ user: null }, { status: 401 });
		}
		return NextResponse.json({ user });
	} catch (error) {
		console.error("Error fetching current user:", error);
		return NextResponse.json({ user: null }, { status: 500 });
	}
}
