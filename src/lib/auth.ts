import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_TOKEN } from "./constants";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/db/prisma";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import type { User } from "@/generated/prisma";

const SECRET = new TextEncoder().encode(process.env.SECRET_KEY);

export type AuthPayload = {
	id: string;
	email: string;
	role: "STUDENT" | "ADMIN" | "SUPER_ADMIN" | "FACULTY";
	name?: string;
};

export async function signAuthToken(payload: AuthPayload) {
	try {
		const token = new SignJWT(payload)
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime("7d")
			.sign(SECRET);

		return token;
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		throw new Error("Token signing failed");
	}
}

export async function verifyAuthToken<T>(token: string): Promise<T> {
	try {
		const { payload } = await jwtVerify(token, SECRET);
		return payload as T;
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		throw new Error("Token decryption failed");
	}
}

export async function setAuthCookie(token: string) {
	try {
		const cookieStore = await cookies();
		cookieStore.set(SESSION_TOKEN, token, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		throw new Error("Failed to set cookie");
	}
}

export async function getAuthCookie() {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_TOKEN);
	return token?.value;
}

export async function removeAuthCookie() {
	try {
		const cookieStore = await cookies();
		cookieStore.delete(SESSION_TOKEN);
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		throw new Error("Failed to remove auth cookie");
	}
}

export async function getSessionUser<T = any>(): Promise<T | null> {
	try {
		const token = await getAuthCookie();
		if (!token) return null;

		const user = await verifyAuthToken<T>(token);
		return user;
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		return null;
	}
}

export async function getSessionUserWithStatus<T = any>(): Promise<{ user: T | null, invalidToken: boolean }> {
	try {
		const token = await getAuthCookie();
		if (!token) return { user: null, invalidToken: false };

		try {
			const user = await verifyAuthToken<T>(token);
			return { user, invalidToken: false };
		} catch {
			// Token is invalid
			return { user: null, invalidToken: true };
		}
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		return { user: null, invalidToken: false };
	}
}

interface ExtendedSession extends Session {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
}

interface ExtendedToken extends JWT {
	id: string;
	name: string;
	email: string;
	role: string;
}

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Invalid credentials");
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
				});

				if (!user) {
					throw new Error("Invalid credentials");
				}

				const isPasswordValid = await compare(credentials.password, user.password);

				if (!isPasswordValid) {
					throw new Error("Invalid credentials");
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],
	callbacks: {
		async session({ session, token }: { session: Session; token: JWT }): Promise<ExtendedSession> {
			if (token) {
				(session as ExtendedSession).user = {
					id: (token as ExtendedToken).id,
					name: (token as ExtendedToken).name,
					email: (token as ExtendedToken).email,
					role: (token as ExtendedToken).role,
				};
			}
			return session as ExtendedSession;
		},
		async jwt({ token, user, account, profile, trigger, isNewUser, session }) {
			if (user) {
				const prismaUser = user as unknown as User;
				token = {
					...token,
					id: prismaUser.id,
					name: prismaUser.name,
					email: prismaUser.email,
					role: prismaUser.role,
				};
			}
			return token;
		},
	},
};
