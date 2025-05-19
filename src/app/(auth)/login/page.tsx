import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
	title: "Login",
};

export default function LoginPage() {
	return (
		<div className="mx-auto max-w-3xl px-8 md:px-0 h-screen w-screen flex flex-col items-center justify-center gap-4">
			<LoginForm />
			<div className="flex items-center justify-center text-center">
				<p className="text-sm">
					By signing in, you agree to our{" "}
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
