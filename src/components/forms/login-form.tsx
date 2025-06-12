"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Loader2Icon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/actions/auth.actions";

interface LoginState {
	message?: string;
	error?: string;
	success?: boolean;
	role?: string;
}

export function LoginForm() {
	const router = useRouter();
	const [state, setState] = useState<LoginState>({});
	const [isPending, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (state.success) {
			toast.success("Login successful.");
			// Redirect based on role
			switch (state.role) {
				case "SUPER_ADMIN":
					router.push("/dashboard/superadmin");
					break;
				case "ADMIN":
					router.push("/dashboard/admin");
					break;
				case "FACULTY":
					router.push("/dashboard/faculty");
					break;
				case "STUDENT":
					router.push("/dashboard/student");
					break;
				default:
					router.push("/dashboard");
			}
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state, router]);

	return (
		<form
			action={(formData) => {
				startTransition(() => {
					loginUser({ success: false, message: "", role: undefined }, formData).then(setState);
				});
			}}
			className="grid gap-4"
		>
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
				<div className="flex items-center">
					<Label htmlFor="password">Password</Label>
					<Link
						href="/forgot-password"
						className="ml-auto inline-block text-sm underline"
					>
						Forgot your password?
					</Link>
				</div>
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
						<Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Logging in...
					</>
				) : (
					"Login"
				)}
			</Button>
		</form>
	);
}
