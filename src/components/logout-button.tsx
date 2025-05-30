"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { logoutUser } from "@/actions/auth.actions";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Loader2Icon, LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";

export function LogoutMenuItem() {
	const [state, setState] = useState({ success: false, message: "" });
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	useEffect(() => {
		if (state.success) {
			toast.success("Logout successful.");
			router.push("/login");
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state, router]);

	return (
		<form
			action={() => {
				startTransition(() => {
					logoutUser().then(setState);
				});
			}}
		>
			<DropdownMenuItem disabled={isPending} asChild>
				<Button
					type="submit"
					className="flex gap-2 w-full"
					disabled={isPending}
				>
					{isPending ? (
						<>
							<Loader2Icon className="size-4 animate-spin" /> Logging out...
						</>
					) : (
						<>
							<LogOutIcon className="size-4" /> Logout
						</>
					)}
				</Button>
			</DropdownMenuItem>
		</form>
	);
}
