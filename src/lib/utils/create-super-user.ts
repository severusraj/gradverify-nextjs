import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import { LoginInfoMessage } from "@/components/mail/login-info-message";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createSuperUser({
	email,
	name,
	password,
}: {
	email: string;
	name: string;
	password: string;
}) {
	try {
		const existingUser = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (existingUser) {
			throw new Error("User with this email already exists.");
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
				role: "SUPER_ADMIN",
			},
		});

		await resend.emails.send({
			from: "GradVerify <noreply@gc-gradverify.site>",
			to: newUser.email,
			subject: `Welcome to GradVerify! ${newUser.name}`,
			react: LoginInfoMessage({
				email: newUser.email,
				originalPassword: password,
				hashedPassword: newUser.password,
			}),
		});
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
	}
}
