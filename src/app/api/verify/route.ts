import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { isAfter } from "date-fns";
import { SEARCH_PARAMS_TOKEN } from "@/lib/utils/constants";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);

	const token = searchParams.get(SEARCH_PARAMS_TOKEN);

	if (!token) {
		return NextResponse.json(
			{
				success: false,
				message: "Token is required.",
			},
			{
				status: 400,
			},
		);
	}

	const verification = await prisma.verificationToken.findUnique({
		where: {
			token,
		},
	});

	if (!verification) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid or expired token.",
			},
			{
				status: 400,
			},
		);
	}

	if (isAfter(new Date(), verification.expires)) {
		return NextResponse.json(
			{
				success: false,
				message: "Token has expired.",
			},
			{
				status: 400,
			},
		);
	}

	await prisma.user.update({
		where: { email: verification.email },
		data: { emailVerified: new Date() },
	});

	await prisma.verificationToken.delete({
		where: {
			token,
		},
	});

	return NextResponse.redirect(new URL("/login", request.url));
}
