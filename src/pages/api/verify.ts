import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/db/prisma";
import { isAfter } from "date-fns";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "GET") {
		return res.status(405).end();
	}

	const token = req.query.token as string;

	if (!token) {
		return res.status(400).json({
			success: false,
			message: "Token is required.",
		});
	}

	const verification = await prisma.verificationToken.findUnique({
		where: {
			token,
		},
	});

	if (!verification) {
		return res.status(400).json({
			success: false,
			message: "Invalid or expired token.",
		});
	}

	if (isAfter(new Date(), verification.expires)) {
		return res.status(400).json({
			success: false,
			message: "Token has expired.",
		});
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

	return res.redirect("/verified");
}
