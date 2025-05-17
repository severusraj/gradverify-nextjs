"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import { signAuthToken, setAuthCookie } from "@/lib/auth";

type ResponseResult = {
	success: boolean;
	message: string;
};

const ALLOWED_ROLES = ["STUDENT", "ADMIN"] as const;

type AllowedRoles = (typeof ALLOWED_ROLES)[number];

export async function loginUser(
	_prevState: ResponseResult,
	formData: FormData,
): Promise<ResponseResult> {
	try {
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const role = formData.get("role") as string;

		if (!email || !password || !role) {
			return {
				success: false,
				message: "All fields are required.",
			};
		}

		if (!ALLOWED_ROLES.includes(role as AllowedRoles)) {
			return {
				success: false,
				message: "Invalid role selected.",
			};
		}

		const user = await prisma.user.findUnique({
			where: {
				email,
				role: role as AllowedRoles,
			},
		});

		if (!user || !user.password) {
			return {
				success: false,
				message: "Invalid email or password.",
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
