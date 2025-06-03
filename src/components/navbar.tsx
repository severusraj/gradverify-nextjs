"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@/lib/utils/current-user";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils/utils";
import { UserMenu } from "./user-menu";

export function Navbar() {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const { getCurrentUserServer } = await import("@/actions/current-user.actions");
				const data = await getCurrentUserServer();
				setUser(data.user);
			} catch (error) {
				console.error("Failed to fetch user:", error);
				setUser(null);
			}
		};
		fetchUser();
	}, []);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ease-in-out">
			<div className="max-w-5xl mx-auto flex items-center justify-between px-6 sm:px-4 md:px-4 lg:px-0 h-16">
				<Link 
					href="/" 
					className="text-xl font-bold tracking-tight md:text-2xl transition-colors hover:text-blue-500"
					prefetch={true}
				>
					Grad<span className="text-blue-500">Verify</span>
				</Link>
				<div className="flex items-center gap-2">
					{user ? (
						<>
							<UserMenu user={user} />
						</>
					) : (
						<>
							<Link
								href="/login"
								className={cn(buttonVariants({ variant: "ghost" }), "transition-colors")}
								prefetch={true}
							>
								Login
							</Link>
							<Link 
								href="/register" 
								className={cn(buttonVariants(), "transition-colors")}
								prefetch={true}
							>
								Register
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
