import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { REQUEST_COOKIES_NAME } from "./check-auth";

const SECRET = new TextEncoder().encode(process.env.SECRET_KEY);

export type AuthPayload = {
	id: string;
	email: string;
	role: "STUDENT" | "ADMIN" | "SUPER_ADMIN" | "FACULTY";
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
		cookieStore.set(REQUEST_COOKIES_NAME, token, {
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
	const token = cookieStore.get(REQUEST_COOKIES_NAME);
	return token?.value;
}

export async function removeAuthCookie() {
	try {
		const cookieStore = await cookies();
		cookieStore.delete(REQUEST_COOKIES_NAME);
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
