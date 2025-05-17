import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getVerificationTokenByToken, deleteVerificationToken } from "@/lib/tokens";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { token } = body;

		if (!token) {
			return new NextResponse("Token is required", { status: 400 });
		}

		const verificationToken = await getVerificationTokenByToken(token);

		if (!verificationToken) {
			return new NextResponse("Invalid token", { status: 400 });
		}

		const hasExpired = new Date(verificationToken.expires) < new Date();

		if (hasExpired) {
			await deleteVerificationToken(verificationToken.id);
			return new NextResponse("Token has expired", { status: 400 });
		}

		// Update user's email verification status
		await db.user.update({
			where: { id: verificationToken.userId },
			data: { emailVerified: new Date() },
		});

		// Delete the used token
		await deleteVerificationToken(verificationToken.id);

		return new NextResponse("Email verified successfully", { status: 200 });
	} catch (error) {
		console.error("[VERIFY_EMAIL]", error);
		return new NextResponse("Internal error", { status: 500 });
	}
} 