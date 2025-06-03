import { verifyAuthToken, getAuthCookie, type AuthPayload } from "../auth/auth";
import { prisma } from "@/db/prisma";

export type UserRole = "ADMIN" | "FACULTY" | "SUPER_ADMIN" | "STUDENT";

// Export the User type
export type User = {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	createdAt: Date;
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

		return user as User;
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		return null;
	}
}
