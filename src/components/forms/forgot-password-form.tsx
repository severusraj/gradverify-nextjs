"use client";

import Link from "next/link";
import { useTransition, useEffect, useState } from "react";
import { Loader2Icon, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/actions/auth.actions";

interface ForgotPasswordState {
	message?: string;
	success?: boolean;
}

export function ForgotPasswordForm() {
	const [state, setState] = useState<ForgotPasswordState>({});
	const [isPending, startTransition] = useTransition();
	const [emailSent, setEmailSent] = useState(false);

	useEffect(() => {
		if (state.success) {
			toast.success(state.message || "Password reset email sent!");
			setEmailSent(true);
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state]);

	if (emailSent) {
		return (
			<div className="text-center space-y-6">
				<div className="flex items-center justify-center">
					<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
						<Mail className="w-8 h-8 text-white" />
					</div>
				</div>
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">
						Check Your Email
					</h2>
					<p className="text-muted-foreground">
						We've sent a password reset link to your email address. 
						Please check your inbox and follow the instructions.
					</p>
				</div>
				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Didn't receive the email? Check your spam folder or try again.
					</p>
					<Button
						variant="outline"
						onClick={() => setEmailSent(false)}
						className="w-full"
					>
						Try Again
					</Button>
				</div>
				<div className="pt-4 border-t border-border">
					<Link
						href="/login"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<form
				action={(formData) => {
					startTransition(() => {
						forgotPassword({ success: false, message: "" }, formData).then(setState);
					});
				}}
				className="space-y-4"
			>
				<div className="space-y-2">
					<Label htmlFor="email">Email Address</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="Enter your email address"
						required
						disabled={isPending}
						className="w-full"
					/>
				</div>
				
				<Button 
					type="submit" 
					className="w-full" 
					disabled={isPending}
				>
					{isPending ? (
						<>
							<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
							Sending Reset Link...
						</>
					) : (
						"Send Reset Link"
					)}
				</Button>
			</form>

			<div className="text-center space-y-4">
				<p className="text-sm text-muted-foreground">
					Remember your password?
				</p>
				<Link
					href="/login"
					className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Login
				</Link>
			</div>
		</div>
	);
} 