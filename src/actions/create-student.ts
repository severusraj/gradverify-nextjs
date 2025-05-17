"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";

type ResponseResult = {
	success: boolean;
	message: string;
};

export async function createStudent(
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

		if (!["ADMIN"].includes(user.role)) {
			return {
				success: false,
				message:
					"Only users with ADMIN permissions can create student account.",
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
				message: "A user with this email already exists.",
			};
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
				role: "STUDENT",
			},
		});

		return {
			success: true,
			message: "Student account created successfully.",
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
