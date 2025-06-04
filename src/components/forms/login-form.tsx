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
			className="block p-6 w-full sm:w-96 rounded-md border bg-background shadow-lg"
		>
			<div className="flex flex-col space-y-4">
				<div className="flex flex-col justify-center text-center space-y-1.5">
					<h1 className="text-lg font-bold leading-snug">
						Continue with Grad<span className="text-blue-500">Verify</span>
					</h1>
					<p className="text-sm text-muted-foreground">
						Proceed with your created student account.
					</p>
				</div>
				<div className="flex flex-col space-y-3">
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
					<Button type="submit" className="w-full h-10">
						{isPending ? (
							<>
								<Loader2Icon className="size-4 animate-spin" /> Logging in...
							</>
						) : (
							<>Login</>
						)}
					</Button>
					<div className="flex items-center justify-center text-center text-sm gap-1.5">
						<p>Don&apos;t have an account?</p>
						<Link
							href="/register"
							className="text-blue-500 underline font-medium"
						>
							Register Now
						</Link>
					</div>
				</div>
			</div>
		</form>
	);
}
