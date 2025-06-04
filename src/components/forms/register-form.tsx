"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Loader2Icon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/actions/auth.actions";

export function RegisterForm() {
	const router = useRouter();
	const [state, setState] = useState({ success: false, message: "" });
	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (state.success) {
			toast.success(
				"Registration successful. Please check your email to verify your account.",
			);
			router.push("/register/verify-your-email");
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state, router]);

	return (
		<form
			action={(formData) => {
				startTransition(() => {
					registerUser({ success: false, message: "" }, formData).then(setState);
				});
			}}
			className="block p-6 w-full sm:w-96 rounded-md border bg-background shadow-lg"
		>
			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-2">
					<h1 className="text-lg font-bold leading-snug text-center">
						Create Student Account
					</h1>
					<p className="text-center text-sm text-muted-foreground">
						Fill out the form below to create your student account.
					</p>
				</div>
				<div className="flex flex-col space-y-3">
					<div className="flex flex-col space-y-1.5">
						<Label htmlFor="name">
							Full Name <span className="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							type="text"
							required
							className="transition-all h-10"
						/>
					</div>
					<div className="flex flex-col space-y-1.5">
						<Label htmlFor="email">
							Email <span className="text-red-500">*</span>
						</Label>
						<Input
							id="email"
							name="email"
							type="email"
							required
							className="transition-all h-10"
						/>
					</div>
					<div className="flex flex-col space-y-1.5">
						<Label htmlFor="password">
							Password <span className="text-red-500">*</span>
						</Label>
						<div className="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								required
								className="transition-all h-10 pr-12"
							/>
							<button
								type="button"
								className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none"
								onClick={() => setShowPassword((v) => !v)}
								tabIndex={-1}
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
							</button>
						</div>
					</div>
					<Button type="submit" className="w-full h-10" disabled={isPending}>
						{isPending ? (
							<>
								<Loader2Icon className="size-4 animate-spin" /> Creating
								account...
							</>
						) : (
							<>Create Account</>
						)}
					</Button>
					<div className="flex items-center justify-center text-center text-sm gap-1.5">
						<p>Already have an account?</p>
						<Link href="/login" className="text-blue-500 underline font-medium">
							Login Now
						</Link>
					</div>
				</div>
			</div>
		</form>
	);
}
