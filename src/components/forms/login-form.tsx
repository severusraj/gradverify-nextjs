"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/actions/login-user";
import { Loader2Icon } from "lucide-react";

const initialState = {
	success: false,
	message: "",
};

export function LoginForm() {
	const router = useRouter();

	const [isPending, startTransition] = useTransition();

	const [state, formAction] = useActionState(loginUser, initialState);

	useEffect(() => {
		if (state.success) {
			toast.success("Login successful.");
			router.push("/dashboard");
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state, router]);

	return (
		<form
			action={(formData) => {
				startTransition(() => {
					formAction(formData);
				});
			}}
			className="block p-6 w-full sm:w-96 rounded-md border bg-background shadow-lg"
		>
			<div className="flex flex-col space-y-4">
				<h1 className="text-lg font-bold leading-snug text-center">
					Login to continue
				</h1>
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
						<Label htmlFor="role">
							Role <span className="text-red-500">*</span>
						</Label>
						<select
							name="role"
							id="role"
							className="inline-flex px-3 items-center justify-between h-10 rounded-md border bg-background text-sm font-medium transition-all appearance-none focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
							required
						>
							<option value="">Select your role</option>
							<option value="STUDENT">Student</option>
							<option value="ADMIN">Admin</option>
						</select>
					</div>
					<div className="flex flex-col space-y-1.5">
						<Label htmlFor="password">
							Password <span className="text-red-500">*</span>
						</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							className="transition-all h-10"
						/>
					</div>
					<div className="flex flex-col space-y-2">
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
			</div>
		</form>
	);
}
