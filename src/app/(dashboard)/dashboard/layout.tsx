"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import { logoutUser } from "@/actions/auth.actions";
import { toast } from "sonner";
import { UserMenu } from "@/components/user-menu";
import { Sidebar } from "@/components/sidebar";

function LoadingBar() {
	return <div className="fixed top-0 left-0 w-full h-1 bg-primary animate-pulse" />;
}

export default function DashboardLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const pathname = usePathname();
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [isPageLoading, setIsPageLoading] = useState(false);

	useEffect(() => {
		setIsPageLoading(false);
	}, [pathname]);

	const handleLogout = async () => {
		try {
			const result = await logoutUser();
			if (result.success) {
				toast.success("Logged out successfully");
				router.push("/login");
			} else {
				toast.error(result.message);
			}
		} catch {
			toast.error("Failed to logout");
		}
	};

	const handleLinkClick = (href: string) => {
		if (pathname !== href) {
			setIsPageLoading(true);
		}
	};

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const { getCurrentUserServer } = await import(
					"@/actions/current-user.actions"
				);
				const data = await getCurrentUserServer();
				if (data.user) {
					setUser(data.user);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error("Error fetching user:", error);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [router]);

	// Redirect to login if not loading and user is null
	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [loading, user, router]);

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-900">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="flex min-h-screen bg-gray-950 text-gray-200">
			<Sidebar
				user={user}
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				handleLogout={handleLogout}
				handleLinkClick={handleLinkClick}
			/>

			{/* Main Content */}
			<div
				className={cn(
					"flex flex-col flex-1 transition-all duration-300 ease-in-out",
					sidebarOpen ? "ml-64" : "ml-20"
				)}
			>
				{isPageLoading && <LoadingBar />}
				<header className="sticky top-0 z-30 flex h-14 items-center justify-end border-b border-gray-700 bg-gray-900 px-4">
					<div className="flex items-center gap-4">
						<UserMenu user={user} />
					</div>
				</header>

				<main className="flex-1 p-4 sm:p-6 lg:p-8">
					<div className="mx-auto w-full max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	);
}