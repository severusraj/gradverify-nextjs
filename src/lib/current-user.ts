import { verifyAuthToken, getAuthCookie, type AuthPayload } from "./auth";
import { prisma } from "@/db/prisma";
import { Role } from "@prisma/client";

// Export the User type
export type User = {
	id: string;
	email: string;
	name: string;
	role: Role;
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
			},
		});

		return user;
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		return null;
	}
}
