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
import { getCurrentUser } from "@/lib/current-user";
import { LayoutDashboardIcon, Settings2Icon } from "lucide-react";
import { LogoutMenuItem } from "./logout-button";

export async function UserMenu() {
	const user = await getCurrentUser();

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
					<Link href="/dashboard" className="flex gap-2">
						<LayoutDashboardIcon className="size-4" /> Dashboard
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/account" className="flex gap-2">
						<Settings2Icon className="size-4" /> Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<LogoutMenuItem />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
