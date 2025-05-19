import { Resend } from "resend";
import { formatToPhilippinesTime } from "../utils/formatDate";

// Log environment variables (without exposing the full API key)
console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string, expires: Date) {
	if (!process.env.RESEND_API_KEY) {
		console.error("RESEND_API_KEY is not configured");
		throw new Error("RESEND_API_KEY is not configured");
	}

	if (!process.env.NEXT_PUBLIC_APP_URL) {
		console.error("NEXT_PUBLIC_APP_URL is not configured");
		throw new Error("NEXT_PUBLIC_APP_URL is not configured");
	}

	const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
	const expiresAt = formatToPhilippinesTime(expires.toISOString());

	const html = `
		<div style="font-family: Arial, sans-serif; color: #222;">
			<h2>Welcome to GradVerify!</h2>
			<p>Hi,</p>
			<p>Thank you for registering with GradVerify. To complete your registration, please verify your email address by clicking the button below:</p>
			<p>
				<a href="${confirmLink}" style="background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Verify Email</a>
			</p>
			<p>This link will expire in 24 hours.</p>
			<p>If you did not create this account, you can safely ignore this email.</p>
			<hr style="margin: 24px 0;">
			<p style="font-size: 13px; color: #888;">
				If you have any questions or need help, please contact us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.
			</p>
		</div>
	`;

	console.log("Sending verification email to:", email);
	console.log("Verification link:", confirmLink);

	try {
		const { data, error } = await resend.emails.send({
			from: "GradVerify <onboarding@resend.dev>",
			to: email,
			subject: "Verify your email address",
			html: html,
		});

		if (error) {
			console.error("Resend API error:", error);
			throw new Error(`Failed to send verification email: ${error.message}`);
		}

		console.log("Email sent successfully:", data);
		return data;
	} catch (error) {
		console.error("Email sending error:", error);
		throw error;
	}
} 