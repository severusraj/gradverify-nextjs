import { db } from "./db";
import { randomBytes } from "crypto";

export async function generateVerificationToken(userId: string) {
	const token = randomBytes(32).toString("hex");
	const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours

	const verificationToken = await db.verificationToken.create({
		data: {
			token,
			expires,
			userId,
		},
	});

	return verificationToken;
}

export async function getVerificationTokenByToken(token: string) {
	try {
		const verificationToken = await db.verificationToken.findUnique({
			where: { token },
		});

		return verificationToken;
	} catch {
		return null;
	}
}

export async function deleteVerificationToken(id: string) {
	await db.verificationToken.delete({
		where: { id },
	});
} 