"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { resendVerificationEmail } from "@/actions/auth.actions";
import { Loader2Icon } from "lucide-react";

const initialState = {
	success: false,
	message: "",
};

export function ResendVerificationEmail() {
	const router = useRouter();

	const [state, setState] = useState({ success: false, message: "" });
	const [isPending, startTransition] = useTransition();

	const [email, setEmail] = useState("");

	const [cooldown, setCooldown] = useState(60);

	useEffect(() => {
		if (cooldown <= 0) {
			return;
		}

		const timer = setInterval(() => {
			setCooldown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [cooldown]);

	useEffect(() => {
		if (state.success) {
			toast.success("Verification email resent successfully.");
			setCooldown(60);
			router.push("/login");
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state, router]);

	return (
		<form
			action={(formData) => {
				startTransition(() => {
					resendVerificationEmail({ success: false, message: "" }, formData).then(setState);
				});
			}}
			className="block p-6 w-full sm:w-96 rounded-md shadow-lg bg-background border"
		>
			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-2">
					<h1 className="text-lg font-bold leading-snug text-center">
						Verify Your Email
					</h1>
					<p className="text-sm text-center text-muted-foreground">
						Enter your email address to resend the verification link.
					</p>
				</div>
				<div className="flex flex-col space-y-3">
					<div className="flex flex-col space-y-1.5">
						<Label htmlFor="email">
							Email Address <span className="text-red-500">*</span>
						</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="transition-all h-10"
						/>
					</div>
					<Button type="submit" disabled={isPending || cooldown > 0 || !email}>
						{isPending ? (
							<>
								<Loader2Icon className="size-4 animate-spin" /> Sending...
							</>
						) : cooldown > 0 ? (
							<>Wait {cooldown}s</>
						) : (
							<>Resend Verification Email</>
						)}
					</Button>
				</div>
			</div>
		</form>
	);
}
