"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { addMinutes } from "date-fns";
import { signAuthToken, setAuthCookie, removeAuthCookie } from "@/lib/auth";
import { NAME_LENGTH, PASSWORD_LENGTH } from "@/lib/constants";
import { sendVerificationEmail } from "@/lib/mailer";
import { Resend } from "resend";
import { LoginInfoMessage } from "@/components/mail/login-info-message";
import { getCurrentUser } from "@/lib/current-user";

type Role = "SUPER_ADMIN" | "ADMIN" | "FACULTY" | "STUDENT";

type ResponseResult = {
	success: boolean;
	message: string;
	role: Role | undefined;
};

const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function createUserAsSuperAdmin({ name, email, password, role }: { name: string; email: string; password: string; role: string }) {
	try {
		// Check if the current user is a super admin
		const currentUser = await getCurrentUser();
		if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
			return { success: false, message: "Unauthorized" };
		}

		// Validate input
		if (!name || !email || !password || !role) {
			return { success: false, message: "Missing required fields" };
		}

		// Validate role
		if (role !== "ADMIN" && role !== "FACULTY") {
			return { success: false, message: "Invalid role" };
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return { success: false, message: "User with this email already exists" };
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role,
				emailVerified: new Date(), // Auto verify admin/faculty accounts
			},
		});

		// Send welcome email
		await resend.emails.send({
			from: "GradVerify <onboarding@resend.dev>",
			to: user.email,
			subject: `Welcome to GradVerify! ${user.name}`,
			react: LoginInfoMessage({
				email: user.email,
				originalPassword: password,
				hashedPassword: user.password,
			}),
		});

		return {
			success: true,
			message: "User created successfully",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		};
	} catch (error) {
		console.error("Error creating user:", error);
		return { success: false, message: "Internal server error" };
	}
}
