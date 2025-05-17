"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import { signAuthToken, setAuthCookie } from "@/lib/auth";

type ResponseResult = {
	success: boolean;
	message: string;
	role?: string;
};

export async function loginUser(
	_prevState: ResponseResult,
	formData: FormData,
): Promise<ResponseResult> {
	try {
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		if (!email || !password) {
			return {
				success: false,
				message: "All fields are required.",
			};
		}

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user || !user.password) {
			return {
				success: false,
				message: "Invalid email or password.",
			};
		}

		if (!user.emailVerified) {
			return {
				success: false,
				message: "Please verify your email before logging in.",
			};
		}

		const isPasswordMatch = await bcrypt.compare(password, user.password);

		if (!isPasswordMatch) {
			return {
				success: false,
				message: "Invalid email or password.",
			};
		}

		const token = await signAuthToken({
			id: user.id,
			email: user.email,
			role: user.role,
		});
		await setAuthCookie(token);

		return {
			success: true,
			message: "Login successful.",
			role: user.role,
		};
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
		return {
			success: false,
			message: "Something went wrong. Please try again.",
		};
	}
}
