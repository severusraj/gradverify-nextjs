import { getCurrentUser } from "@/lib/current-user";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const user = await getCurrentUser();
		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching current user:", error);
		return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
	}
}
