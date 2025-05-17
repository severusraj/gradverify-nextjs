"use client";

import Link from "next/link";
import { useActionState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { register } from "@/actions/register";
import { Loader2Icon } from "lucide-react";

const initialState = {
	success: false,
	message: "",
};

export function RegisterForm() {
	const [isPending, startTransition] = useTransition();

	const [state, formAction] = useActionState(register, initialState);

	useEffect(() => {
		if (state.success) {
			toast.success("Email successfully sent.");
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state]);

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
				<div className="flex flex-col space-y-2">
					<h1 className="text-lg font-bold leading-snug text-center">
						Register an account
					</h1>
					<p className="text-center text-sm text-muted-foreground">
						To register an account, kindly complete the form below and submit it
						via email.
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

					<div className="flex flex-col space-y-2">
						<Button type="submit" className="w-full h-10">
							{isPending ? (
								<>
									<Loader2Icon className="size-4 animate-spin" /> Sending...
								</>
							) : (
								<>Send Email</>
							)}
						</Button>
						<div className="flex items-center justify-center text-center text-sm gap-1.5">
							<p>Already have an account?</p>
							<Link
								href="/login"
								className="text-blue-500 underline font-medium"
							>
								Login Now
							</Link>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
