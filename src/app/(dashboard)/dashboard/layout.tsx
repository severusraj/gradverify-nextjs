"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import {
	LayoutDashboard,
	Users,
	CheckCircle2,
	Award,
	FileText,
	Settings,
	Menu,
	LineChart,
	Send,
	LogOut,
	User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logoutUser } from "@/actions/auth.actions";
import { toast } from "sonner";
import { UserMenu } from "@/components/user-menu";

const navItems = {
	SUPER_ADMIN: [
		{
			href: "/dashboard/superadmin",
			title: "Overview",
			icon: <LayoutDashboard className="w-4 h-4" />,
		},
		{
			href: "/dashboard/superadmin/analytics",
			title: "Analytics",
			icon: <LineChart className="w-4 h-4" />,
		},
		{
			href: "/dashboard/superadmin/verification",
			title: "Verification",
			icon: <CheckCircle2 className="w-4 h-4" />,
		},
		{
			href: "/dashboard/superadmin/users",
			title: "User Management",
			icon: <Users className="w-4 h-4" />,
		},
		{
			href: "/dashboard/superadmin/awards",
			title: "Awards",
			icon: <Award className="w-4 h-4" />,
		},
		{
			href: "/dashboard/superadmin/reports",
			title: "Reports",
			icon: <FileText className="w-4 h-4" />,
		},
		{
			href: "/dashboard/superadmin/settings",
			title: "Settings",
			icon: <Settings className="w-4 h-4" />,
		},
		{
			href: "/dashboard/superadmin/invitations",
			title: "Invitations",
			icon: <Send className="w-4 h-4" />,
		},
	],
	ADMIN: [
		{
			href: "/dashboard/admin",
			title: "Overview",
			icon: <LayoutDashboard className="w-4 h-4" />,
		},
		{
			href: "/dashboard/admin/verification",
			title: "Verification",
			icon: <CheckCircle2 className="w-4 h-4" />,
		},
		{
			href: "/dashboard/admin/reports",
			title: "Reports",
			icon: <FileText className="w-4 h-4" />,
		},
		{
			href: "/dashboard/admin/settings",
			title: "Settings",
			icon: <Settings className="w-4 h-4" />,
		},
	],
	FACULTY: [
		{
			href: "/dashboard/faculty",
			title: "Dashboard",
			icon: <LayoutDashboard className="w-4 h-4" />,
		},
		{
			href: "/dashboard/faculty/verification",
			title: "Verification",
			icon: <CheckCircle2 className="w-4 h-4" />,
		},
		{
			href: "/dashboard/faculty/profile",
			title: "Profile",
			icon: <User className="w-4 h-4" />,
		},
	],
	STUDENT: [
		{
			href: "/dashboard/student",
			title: "Dashboard",
			icon: <LayoutDashboard className="w-4 h-4" />,
		},
		{
			href: "/dashboard/student/profile",
			title: "Profile",
			icon: <User className="w-4 h-4" />,
		},
	],
};

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

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch("/api/current-user");
				const data = await response.json();
				if (data.user) {
					setUser(data.user);
				} else {
					router.push("/login");
				}
			} catch (error) {
				console.error("Error fetching user:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [router]);

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user) {
		router.push("/login");
		return null;
	}

	const roleNavItems = navItems[user.role as keyof typeof navItems] || [];

	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<aside
				className={cn(
					"fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform duration-200 ease-in-out",
					!sidebarOpen && "-translate-x-full"
				)}
			>
				<div className="flex h-14 items-center border-b px-4">
					<span className="font-semibold">GradVerify</span>
				</div>
				<ScrollArea className="h-[calc(100vh-3.5rem)] flex flex-col justify-between">
					<div className="space-y-1 p-2">
						{roleNavItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								prefetch={true}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
									pathname === item.href && "bg-accent"
								)}
							>
								{item.icon}
								{item.title}
							</Link>
						))}
					</div>
					<div className="p-4 border-t">
						<Button
							variant="outline"
							className="w-full justify-start gap-2"
							onClick={handleLogout}
						>
							<LogOut className="w-4 h-4" />
							Logout
						</Button>
					</div>
				</ScrollArea>
			</aside>

			{/* Main Content */}
			<div
				className={cn(
					"flex-1 transition-all duration-200 ease-in-out",
					sidebarOpen ? "ml-64" : "ml-0"
				)}
			>
				<div className="sticky top-0 z-30 flex h-14 items-center border-b bg-background px-4 justify-between">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						<Menu className="h-4 w-4" />
					</Button>
					<UserMenu user={user} />
				</div>
				<main className="flex-1 p-6">{children}</main>
			</div>
		</div>
	);
}