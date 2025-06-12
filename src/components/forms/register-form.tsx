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
			className="grid gap-4"
		>
			<div className="grid gap-2">
				<Label htmlFor="name">Full Name</Label>
				<Input id="name" name="name" placeholder="John Doe" required />
			</div>
			<div className="grid gap-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="m@example.com"
					required
				/>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="password">Password</Label>
				<div className="relative">
					<Input
						id="password"
						name="password"
						type={showPassword ? "text" : "password"}
						required
						className="pr-12"
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
			</div>
			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? (
					<>
						<Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
					</>
				) : (
					"Create an account"
				)}
			</Button>
		</form>
	);
}
