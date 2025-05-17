"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { EmailToGradVerify } from "@/components/email-component";

const resend = new Resend(process.env.RESEND_API_KEY);

type ResponseResult = {
	success: boolean;
	message: string;
};

type Role = "ADMIN" | "STUDENT";

export async function register(
	_prevState: ResponseResult,
	formData: FormData,
): Promise<ResponseResult> {
	try {
		const email = formData.get("email") as string;
		const name = formData.get("name") as string;
		const role = formData.get("role") as string;

		if (!email || !name || !role) {
			return {
				success: false,
				message: "All fields are required.",
			};
		}

		await resend.emails.send({
			from: `${email} <onboarding@resend.dev>`,
			to: "garcia.johngale@gmail.com",
			subject: `${email} (${name}) sends an email.`,
			react: EmailToGradVerify({ name, email, role: role as Role }),
		});

		revalidatePath("/register");

		return {
			success: true,
			message: "Email successfully sent.",
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
