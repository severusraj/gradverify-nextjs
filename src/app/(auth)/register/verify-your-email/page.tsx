import { ResendVerificationEmail } from "@/components/forms/resend-verification-email-form";
import { prisma } from "@/db/prisma";
import { redirect } from "next/navigation";
import { getSessionUser, type AuthPayload } from "@/lib/auth";

export const metadata = {
	title: "Register Your Email",
};

export default async function RegisterYourEmailPage() {
	const sessionUser = await getSessionUser<AuthPayload>();

	if (sessionUser?.id) {
		const user = await prisma.user.findUnique({
			where: { id: sessionUser.id },
		});

		if (user?.emailVerified) {
			redirect("/login");
		}
	}

	return (
		<div className="mx-auto max-w-3xl px-8 md:px-0 h-screen w-screen flex items-center justify-center">
			<ResendVerificationEmail />
		</div>
	);
}
