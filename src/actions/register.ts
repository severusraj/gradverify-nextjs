"use server";

import { z } from "zod";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";

const registerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function register(formData: FormData) {
	try {
		const validatedFields = registerSchema.safeParse({
			name: formData.get("name"),
			email: formData.get("email"),
			password: formData.get("password"),
		});

		if (!validatedFields.success) {
			return {
				success: false,
				message: "Invalid form data",
			};
		}

		const { name, email, password } = validatedFields.data;

		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			if (!existingUser.emailVerified) {
				// Resend verification email
				const verificationToken = await generateVerificationToken(existingUser.id);
				await sendVerificationEmail(existingUser.email, verificationToken.token, verificationToken.expires);
				return {
					success: false,
					message: "This email is already registered but unverified. Check your inbox or resend the verification link.",
				};
			}
			return {
				success: false,
				message: "User with this email already exists",
			};
		}

		// Hash password
		const hashedPassword = await hash(password, 12);

		// Create user
		const user = await db.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: "STUDENT",
			},
		});

		try {
			// Generate verification token
			const verificationToken = await generateVerificationToken(user.id);

			// Send verification email
			await sendVerificationEmail(user.email, verificationToken.token, verificationToken.expires);

			return {
				success: true,
				message: "Account created successfully",
			};
		} catch (emailError) {
			// If email sending fails, delete the user and return error
			await db.user.delete({
				where: { id: user.id },
			});
			
			console.error("Email verification error:", emailError);
			return {
				success: false,
				message: "Failed to send verification email. Please try again.",
			};
		}
	} catch (error) {
		console.error("Registration error:", error);
		return {
			success: false,
			message: "Something went wrong. Please try again.",
		};
	}
}
