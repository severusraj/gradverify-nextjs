import { verifyAuthToken, getAuthCookie, type AuthPayload } from "../auth/auth";
import { prisma } from "@/db/prisma";

// Export the User type
export type User = {
	id: string;
	email: string;
	name: string;
	role: string;
	createdAt: string;
};

export async function getCurrentUser(): Promise<User | null> {
	try {
		const token = await getAuthCookie();

		if (!token) {
			return null;
		}

		const payload = (await verifyAuthToken(token)) as AuthPayload;

		if (!payload.id) {
			return null;
		}

		const user = await prisma.user.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true,
			},
		});

		if (!user) {
			return null;
		}

		return { ...user, createdAt: user.createdAt.toISOString() };
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		return null;
	}
}
