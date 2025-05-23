"use client";

import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User } from "@/lib/current-user";
import { LayoutDashboardIcon, Settings2Icon } from "lucide-react";
import { LogoutMenuItem } from "./logout-button";

interface UserMenuProps {
	user: User | null;
}

export function UserMenu({ user }: UserMenuProps) {
	const dashboardPath =
		user?.role === "SUPER_ADMIN"
			? "/dashboard/superadmin"
			: user?.role === "ADMIN"
				? "/dashboard/admin"
				: user?.role === "FACULTY"
					? "/dashboard/faculty"
					: user?.role === "STUDENT"
						? "/dashboard/student"
						: "/dashboard";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="hover:bg-transparent rounded-full"
				>
					<Avatar>
						<AvatarFallback className="bg-blue-500 text-white">
							{user && user.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="flex flex-col space-y-0.5">
					<span className="font-semibold capitalize">{user?.name}</span>
					<span className="text-xs text-muted-foreground">{user?.email}</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href={dashboardPath} className="flex gap-2">
						<LayoutDashboardIcon className="size-4" /> Dashboard
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/dashboard/settings" className="flex gap-2">
						<Settings2Icon className="size-4" /> Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<LogoutMenuItem />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
