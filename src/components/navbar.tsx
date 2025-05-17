import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

export async function Navbar() {
	const user = await getCurrentUser();

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="max-w-5xl mx-auto flex items-center justify-between px-6 sm:px-4 md:px-4 lg:px-0 h-16">
				<Link href="/" className="text-xl font-bold tracking-tight md:text-2xl">
					Grad<span className="text-blue-500">Verify</span>
				</Link>
				<div className="flex items-center gap-2">
					{user ? (
						<>
							<UserMenu />
						</>
					) : (
						<>
							<Link
								href="/login"
								className={cn(buttonVariants({ variant: "ghost" }))}
							>
								Login
							</Link>
							<Link href="/register" className={cn(buttonVariants())}>
								Register
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
