import { Resend } from "resend";
import { VerifyEmailMessage } from "@/components/mail/verify-email-message";

const resend = new Resend(process.env.RESEND_API_KEY!);

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // This will fallback to localhost if the environment variable is missing

export async function sendVerificationEmail(
	email: string,
	token: string,
	name?: string,
) {
	const verifyUrl = `${baseUrl}/verify?token=${token}`;

	await resend.emails.send({
		from: "GradVerify <noreply@gc-gradverify.site>",
		to: email,
		subject: "Verify Your Email",
		react: VerifyEmailMessage({ verifyUrl: verifyUrl, name: name! }),
	});
}
