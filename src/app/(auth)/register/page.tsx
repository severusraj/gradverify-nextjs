import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = {
	title: "Register",
};

export default function RegisterPage() {
	return (
		<div className="mx-auto max-w-3xl px-8 md:px-0 h-screen w-screen flex flex-col items-center justify-center gap-4">
			<RegisterForm />
			<div className="flex items-center justify-center text-center">
				<p className="text-sm">
					By creating an account, you agree to our{" "}
					<Link href="/terms" className="text-blue-500 underline font-medium">
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link href="/privacy" className="text-blue-500 underline font-medium">
						Privacy Policy
					</Link>
					.
				</p>
			</div>
		</div>
	);
}
