"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
	const [isVerifying, setIsVerifying] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [resendCount, setResendCount] = useState(0);
	const [maxResends, setMaxResends] = useState(5); // Should match backend
	const [email, setEmail] = useState("");
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const router = useRouter();

	useEffect(() => {
		if (token) {
			verifyEmail();
		}
	}, [token]);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (cooldown > 0) {
			timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
		}
		return () => clearTimeout(timer);
	}, [cooldown]);

	const verifyEmail = async () => {
		try {
			setIsVerifying(true);
			const response = await fetch("/api/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
			});

			const data = await response.json();

			if (response.ok) {
				router.replace("/login?verified=success");
			} else {
				router.replace("/login?verified=error");
			}
		} catch (error) {
			router.replace("/login?verified=error");
		} finally {
			setIsVerifying(false);
		}
	};

	const handleResend = async () => {
		if (!email) {
			toast.error("Please enter your email to resend verification.");
			return;
		}
		setIsResending(true);
		try {
			const response = await fetch("/api/resend-verification", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await response.json();
			if (response.ok) {
				setCooldown(60); // Should match backend
				setResendCount((c) => c + 1);
				toast.success(data.message || "Verification email resent. Please check your inbox.");
			} else {
				if (data.message?.includes("maximum number")) setResendCount(maxResends);
				toast.error(data.message || "Failed to resend verification email.");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Email Verification</CardTitle>
					<CardDescription>
						{token
							? "Please wait while we verify your email address."
							: "Please check your email for the verification link. If you haven't received it, you can request a new one below."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isVerifying ? (
						<div className="flex flex-col items-center justify-center space-y-4">
							<Loader2Icon className="size-8 animate-spin" />
							<p>Verifying your email...</p>
						</div>
					) : isVerified ? (
						<div className="flex flex-col items-center justify-center space-y-4">
							<p className="text-center text-green-600">
								Your email has been verified successfully!
							</p>
							<Button asChild>
								<Link href="/login">Proceed to Login</Link>
							</Button>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center space-y-4">
							<p className="text-center text-muted-foreground">
								Please check your email for the verification link. If you haven't received it, you can request a new one below.
							</p>
							<input
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full border rounded px-3 py-2"
							/>
							<Button
								onClick={handleResend}
								disabled={isResending || cooldown > 0 || resendCount >= maxResends}
								className="w-full"
							>
								{isResending ? (
									<Loader2Icon className="size-4 animate-spin" />
								) : cooldown > 0 ? (
									`Resend available in ${cooldown}s`
								) : resendCount >= maxResends ? (
									"Resend limit reached"
								) : (
									"Resend Verification Email"
								)}
							</Button>
							<p className="text-xs text-muted-foreground text-center">
								You can resend the verification email up to {maxResends} times. Each resend is limited to once per minute.<br />
								Verification links expire after 2 hours. Unverified accounts are deleted after 48 hours.<br />
								Need help? Contact <a href="mailto:support@example.com" className="underline">support@example.com</a>.
							</p>
							<Button asChild variant="ghost">
								<Link href="/login">Back to Login</Link>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
} 