"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Loader2Icon, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/actions/auth.actions";

interface ResetPasswordState {
	message?: string;
	success?: boolean;
}

export function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	
	const [state, setState] = useState<ResetPasswordState>({});
	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [resetSuccess, setResetSuccess] = useState(false);

	useEffect(() => {
		if (state.success) {
			toast.success(state.message || "Password reset successful!");
			setResetSuccess(true);
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state]);

	// If no token, show error
	if (!token) {
		return (
			<div className="text-center space-y-6">
				<div className="flex items-center justify-center">
					<div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
						<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
				</div>
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">
						Invalid Reset Link
					</h2>
					<p className="text-muted-foreground">
						This password reset link is invalid or has expired. 
						Please request a new one.
					</p>
				</div>
				<div className="space-y-4">
					<Link href="/forgot-password">
						<Button className="w-full">
							Request New Reset Link
						</Button>
					</Link>
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

	// If reset was successful, show success message
	if (resetSuccess) {
		return (
			<div className="text-center space-y-6">
				<div className="flex items-center justify-center">
					<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
						<CheckCircle className="w-8 h-8 text-white" />
					</div>
				</div>
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">
						Password Reset Complete!
					</h2>
					<p className="text-muted-foreground">
						Your password has been successfully updated. 
						You can now log in with your new password.
					</p>
				</div>
				<Button
					onClick={() => router.push("/login")}
					className="w-full"
				>
					Continue to Login
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<form
				action={(formData) => {
					// Add the token to the form data
					formData.append("token", token);
					startTransition(() => {
						resetPassword({ success: false, message: "" }, formData).then(setState);
					});
				}}
				className="space-y-4"
			>
				<div className="space-y-2">
					<Label htmlFor="password">New Password</Label>
					<div className="relative">
						<Input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							placeholder="Enter your new password"
							required
							disabled={isPending}
							className="pr-12"
							minLength={8}
						/>
						<button
							type="button"
							className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
							onClick={() => setShowPassword((v) => !v)}
							tabIndex={-1}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					<p className="text-xs text-muted-foreground">
						Password must be at least 8 characters long
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm New Password</Label>
					<div className="relative">
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
							placeholder="Confirm your new password"
							required
							disabled={isPending}
							className="pr-12"
							minLength={8}
						/>
						<button
							type="button"
							className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
							onClick={() => setShowConfirmPassword((v) => !v)}
							tabIndex={-1}
							aria-label={showConfirmPassword ? "Hide password" : "Show password"}
						>
							{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
				</div>
				
				<Button 
					type="submit" 
					className="w-full" 
					disabled={isPending}
				>
					{isPending ? (
						<>
							<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
							Resetting Password...
						</>
					) : (
						"Reset Password"
					)}
				</Button>
			</form>

			<div className="text-center">
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