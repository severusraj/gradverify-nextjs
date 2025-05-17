"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { logoutUser } from "@/actions/logout-user";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Loader2Icon, LogOutIcon } from "lucide-react";

const initialState = {
	success: false,
	message: "",
};

export function LogoutMenuItem() {
	const router = useRouter();

	const [isPending, startTransition] = useTransition();

	const [state, formAction] = useActionState(logoutUser, initialState);

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
					formAction();
				});
			}}
		>
			<DropdownMenuItem asChild>
				<button type="submit" className="flex gap-2 w-full">
					{isPending ? (
						<>
							<Loader2Icon className="size-4 animate-spin" /> Logging out...
						</>
					) : (
						<>
							<LogOutIcon className="size-4" /> Logout
						</>
					)}
				</button>
			</DropdownMenuItem>
		</form>
	);
}
