"use client";

import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";


export default function LoginPage() {
	const searchParams = useSearchParams();

	useEffect(() => {
		const verified = searchParams.get("verified");
		if (verified === "success") {
			toast.success("Your email has been verified! You can now log in.");
		} else if (verified === "error") {
			toast.error("Verification link expired or invalid. Please log in or request a new verification email.");
		}
	}, [searchParams]);

	return (
		<div className="mx-auto max-w-3xl px-8 md:px-0 pt-8 pb-10 h-screen w-screen flex flex-col items-center justify-center gap-4">
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
