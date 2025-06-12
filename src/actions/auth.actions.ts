"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { addMinutes } from "date-fns";
import { signAuthToken, setAuthCookie, removeAuthCookie } from "@/lib/auth/auth";
import { NAME_LENGTH, PASSWORD_LENGTH } from "@/lib/utils/constants";
import { sendVerificationEmail } from "@/lib/utils/mailer";
import { Resend } from "resend";
import { LoginInfoMessage } from "@/components/mail/login-info-message";
import { getCurrentUser } from "@/lib/utils/current-user";

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

		// Rate limiting
		const now = new Date();
		if (user.lastResendAt) {
			const timeDiff = now.getTime() - user.lastResendAt.getTime();
			const minutesDiff = Math.floor(timeDiff / (1000 * 60));

			if (minutesDiff < 2) {
				// 2 minutes cooldown
				return {
					success: false,
					message: "You must wait at least 2 minutes before resending.",
				};
			}
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

		await prisma.user.update({
			where: { email },
			data: {
				lastResendAt: now,
				resendCount: {
					increment: 1,
				},
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

// Forgot Password Server Action
export async function forgotPassword(
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

		// Always return success to prevent email enumeration
		if (!user) {
			return {
				success: true,
				message: "If an account with that email exists, we've sent a password reset link.",
			};
		}

		// Rate limiting: 2 minutes cooldown
		const now = new Date();
		if (user.lastForgotPasswordAt) {
			const timeDiff = now.getTime() - user.lastForgotPasswordAt.getTime();
			const minutesDiff = Math.floor(timeDiff / (1000 * 60));
			if (minutesDiff < 2) {
				return {
					success: false,
					message: "You must wait at least 2 minutes before requesting another reset.",
				};
			}
		}

		// Delete any existing password reset tokens for this email
		await prisma.passwordResetToken.deleteMany({
			where: { email },
		});

		// Generate new reset token
		const token = crypto.randomBytes(32).toString("hex");
		const expires = addMinutes(new Date(), 15); // 15 minutes expiry

		await prisma.passwordResetToken.create({
			data: {
				email,
				token,
				expires,
			},
		});

		// Update lastForgotPasswordAt
		await prisma.user.update({
			where: { email },
			data: { lastForgotPasswordAt: now },
		});

		// Send password reset email
		await sendPasswordResetEmail(email, token, user.name);

		return {
			success: true,
			message: "If an account with that email exists, we've sent a password reset link.",
		};
	} catch (error_) {
		const error = error_ as Error;
		console.error("Forgot password error:", error.message, error);
		return {
			success: false,
			message: "Something went wrong. Please try again.",
		};
	}
}

// Reset Password Server Action
export async function resetPassword(
	_prevState: { success: boolean; message: string },
	formData: FormData,
): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const token = formData.get("token") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (!token || !password || !confirmPassword) {
			return {
				success: false,
				message: "All fields are required.",
			};
		}

		if (password !== confirmPassword) {
			return {
				success: false,
				message: "Passwords do not match.",
			};
		}

		if (password.length < PASSWORD_LENGTH) {
			return {
				success: false,
				message: "Password must be at least 8 characters long.",
			};
		}

		// Find valid reset token
		const resetToken = await prisma.passwordResetToken.findUnique({
			where: { token },
		});

		if (!resetToken || resetToken.expires < new Date()) {
			return {
				success: false,
				message: "Invalid or expired reset token.",
			};
		}

		// Find user
		const user = await prisma.user.findUnique({
			where: { email: resetToken.email },
		});

		if (!user) {
			return {
				success: false,
				message: "User not found.",
			};
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update user password
		await prisma.user.update({
			where: { id: user.id },
			data: { password: hashedPassword },
		});

		// Delete the used reset token
		await prisma.passwordResetToken.delete({
			where: { token },
		});

		// Delete all other reset tokens for this email
		await prisma.passwordResetToken.deleteMany({
			where: { email: resetToken.email },
		});

		return {
			success: true,
			message: "Password reset successful. You can now log in with your new password.",
		};
	} catch (error_) {
		const error = error_ as Error;
		console.error("Reset password error:", error.message, error);
		return {
			success: false,
			message: "Something went wrong. Please try again.",
		};
	}
}

// Send Password Reset Email
async function sendPasswordResetEmail(email: string, token: string, name: string) {
	try {
		const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
		
		await resend.emails.send({
			from: "GradVerify <noreply@gc-gradverify.space>",
			to: email,
			subject: "Reset Your Password - GradVerify",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #3b82f6; margin: 0;">GradVerify</h1>
						<p style="color: #6b7280; margin: 5px 0;">Academic Verification Platform</p>
					</div>
					
					<div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
						<h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
						<p style="color: #4b5563; line-height: 1.6;">
							Hello ${name},
						</p>
						<p style="color: #4b5563; line-height: 1.6;">
							We received a request to reset your password for your GradVerify account. 
							Click the button below to reset your password:
						</p>
						
						<div style="text-align: center; margin: 30px 0;">
							<a href="${resetUrl}" 
							   style="background: #3b82f6; color: white; padding: 12px 30px; 
							          text-decoration: none; border-radius: 6px; display: inline-block;
							          font-weight: 500;">
								Reset Password
							</a>
						</div>
						
						<p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
							This link will expire in 15 minutes for security reasons.
						</p>
						
						<p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
							If you didn't request this password reset, please ignore this email. 
							Your password will remain unchanged.
						</p>
					</div>
					
					<div style="text-align: center; color: #9ca3af; font-size: 12px;">
						<p>© 2024 GradVerify. All rights reserved.</p>
						<p>Gordon College - Computer and Information Sciences</p>
					</div>
				</div>
			`,
		});
	} catch (error) {
		console.error("Failed to send password reset email:", error);
		throw error;
	}
}

export async function createUserAsSuperAdmin({ name, email, password, role }: { name: string; email: string; password: string; role: string }) {
	try {
		// Check if the current user is a super admin
		const currentUser = await getCurrentUser();
		if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
			return { success: false, message: "Forbidden" };
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
			from: "GradVerify <noreply@gc-gradverify.space>",
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
