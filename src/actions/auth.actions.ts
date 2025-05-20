"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { addMinutes } from "date-fns";
import { signAuthToken, setAuthCookie, removeAuthCookie } from "@/lib/auth";
import { NAME_LENGTH, PASSWORD_LENGTH } from "@/lib/constants";
import { sendVerificationEmail } from "@/lib/mailer";

type Role = "SUPER_ADMIN" | "ADMIN" | "FACULTY" | "STUDENT";

type ResponseResult = {
	success: boolean;
	message: string;
	role: Role | undefined;
};

// Login User Server Action
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
				message: "Email and password are required.",
				role: undefined,
			};
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return {
				success: false,
				message: "Invalid email format.",
				role: undefined,
			};
		}

		if (password.length < PASSWORD_LENGTH) {
			return {
				success: false,
				message: "Password must be at least 8 characters.",
				role: undefined,
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
				role: undefined,
			};
		}

		if (!user.emailVerified) {
			return {
				success: false,
				message: "Please verify your email before logging in.",
				role: undefined,
			};
		}

		const isPasswordMatch = await bcrypt.compare(password, user.password);

		if (!isPasswordMatch) {
			return {
				success: false,
				message: "Invalid email or password.",
				role: undefined,
			};
		}

		const sessionToken = await signAuthToken({
			id: user.id,
			email: user.email,
			role: user.role,
			name: user.name,
		});
		await setAuthCookie(sessionToken);

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
			role: undefined,
		};
	}
}

// Register User Server Action
export async function registerUser(
	_prevState: { success: boolean; message: string },
	formData: FormData,
): Promise<{
	success: boolean;
	message: string;
}> {
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

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return {
				success: false,
				message: "Invalid email format.",
			};
		}

		if (name.length < NAME_LENGTH) {
			return {
				success: false,
				message: "Name must be at least 2 characters long.",
			};
		}

		if (password.length < PASSWORD_LENGTH) {
			return {
				success: false,
				message: "Password must be at least 8 characters long.",
			};
		}

		const existingUser = await prisma.user.findUnique({
			where: {
				email,
				role: "STUDENT",
			},
		});

		if (existingUser) {
			return {
				success: false,
				message: "User with this email already exists.",
			};
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
				role: "STUDENT",
			},
		});

		const token = crypto.randomBytes(32).toString("hex");
		const expires = addMinutes(new Date(), 30);

		await prisma.verificationToken.create({
			data: {
				email: newUser.email,
				token,
				expires,
			},
		});

		await sendVerificationEmail(newUser.email, token, newUser.name);

		return {
			success: true,
			message:
				"Registration successful. Please check your email to verify your account.",
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

// Logout User Server Action
export async function logoutUser(): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		await removeAuthCookie();

		return {
			success: true,
			message: "Logout successful.",
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

// Server Action for Resending Verification Email
export async function resendVerificationEmail(
	_prevState: { success: boolean; message: string },
	formData: FormData,
): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const email = formData.get("email") as string;

		if (!email) {
			return {
				success: false,
				message: "Email is required.",
			};
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return {
				success: false,
				message: "Invalid email format.",
			};
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return {
				success: false,
				message: "No user found with this email.",
			};
		}

		if (user.emailVerified) {
			return {
				success: false,
				message: "Email is already verified.",
			};
		}

		const token = crypto.randomBytes(32).toString("hex");
		const expires = addMinutes(new Date(), 30);

		await prisma.verificationToken.deleteMany({
			where: { email },
		});

		await prisma.verificationToken.create({
			data: {
				email,
				token,
				expires,
			},
		});

		await sendVerificationEmail(user.email, token, user.name);

		return {
			success: true,
			message: "Verification email resent successfully.",
		};
	} catch (error_) {
		const error = error_ as Error;
		console.error(error, error.message);
		return {
			success: false,
			message: "Something went wrong. Please try again.",
		};
	}
}
