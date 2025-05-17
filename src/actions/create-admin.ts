"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import { verifyAuthToken, getAuthCookie } from "@/lib/auth";

type ResponseResult = {
	success: boolean;
	message: string;
};

export async function createAdmin(
	_prevState: ResponseResult,
	formData: FormData,
): Promise<ResponseResult> {
	try {
		const email = formData.get("email") as string;
		const name = formData.get("name") as string;
		const password = formData.get("password") as string;

		if (!email || !name || !password) {
			return {
				success: false,
				message: "All fields are required.",
			};
		}

		const token = await getAuthCookie();
		if (!token) {
			return {
				success: false,
				message: "Unauthorized access.",
			};
		}

		const user = await verifyAuthToken<{ id: string; role: string }>(token);

		if (!["SUPER_ADMIN"].includes(user.role)) {
			return {
				success: false,
				message:
					"Only users with SUPER_ADMIN permissions can create admin account.",
			};
		}

		const existingUser = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (existingUser) {
			return {
				success: false,
				message: "User with this email already exists.",
			};
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
				role: "ADMIN",
			},
		});

		return {
			success: true,
			message: "Admin account created successfully.",
		};
	} catch (error_) {
		const error = error_ as Error;
		console.error("Registration error: ", error.message, error);
		return {
			success: false,
			message: "Something went wrong. Please try again.",
		};
	}
}
