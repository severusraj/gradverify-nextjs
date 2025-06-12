"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import {
	LayoutDashboard,
	Users,
	CheckCircle2,
	Award,
	FileText,
	Settings,
	LineChart,
	Send,
	LogOut,
	User,
	Shield,
	ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const navItems = {
	SUPER_ADMIN: [
		{
			href: "/dashboard/superadmin",
			title: "Overview",
			icon: <LayoutDashboard className="w-5 h-5" />,
		},
		{
			href: "/dashboard/superadmin/analytics",
			title: "Analytics",
			icon: <LineChart className="w-5 h-5" />,
		},
		{
			href: "/dashboard/superadmin/verification",
			title: "Verification",
			icon: <CheckCircle2 className="w-5 h-5" />,
		},
		{
			href: "/dashboard/superadmin/users",
			title: "User Management",
			icon: <Users className="w-5 h-5" />,
		},
		{
			href: "/dashboard/superadmin/awards",
			title: "Awards",
			icon: <Award className="w-5 h-5" />,
		},
		{
			href: "/dashboard/superadmin/reports",
			title: "Reports",
			icon: <FileText className="w-5 h-5" />,
		},
		{
			href: "/dashboard/superadmin/audit-logs",
			title: "Audit Logs",
			icon: <Shield className="w-5 h-5" />,
		},
		{
			href: "/dashboard/superadmin/settings",
			title: "Settings",
			icon: <Settings className="w-5 h-5" />,
		},
		{
			href: "/dashboard/superadmin/invitations",
			title: "Invitations",
			icon: <Send className="w-5 h-5" />,
		},
	],
	ADMIN: [
		{
			href: "/dashboard/admin",
			title: "Overview",
			icon: <LayoutDashboard className="w-5 h-5" />,
		},
		{
			href: "/dashboard/admin/verification",
			title: "Verification",
			icon: <CheckCircle2 className="w-5 h-5" />,
		},
		{
			href: "/dashboard/admin/reports",
			title: "Reports",
			icon: <FileText className="w-5 h-5" />,
		},
		{
			href: "/dashboard/admin/settings",
			title: "Settings",
			icon: <Settings className="w-5 h-5" />,
		},
	],
	FACULTY: [
		{
			href: "/dashboard/faculty",
			title: "Dashboard",
			icon: <LayoutDashboard className="w-5 h-5" />,
		},
		{
			href: "/dashboard/faculty/verification",
			title: "Verification",
			icon: <CheckCircle2 className="w-5 h-5" />,
		},
		{
			href: "/dashboard/faculty/profile",
			title: "Profile",
			icon: <User className="w-5 h-5" />,
		},
	],
	STUDENT: [
		{
			href: "/dashboard/student",
			title: "Dashboard",
			icon: <LayoutDashboard className="w-5 h-5" />,
		},
		{
			href: "/dashboard/student/profile",
			title: "Profile",
			icon: <User className="w-5 h-5" />,
		},
	],
};

type SidebarProps = {
	user: any;
	sidebarOpen: boolean;
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	handleLogout: () => void;
	handleLinkClick: (href: string) => void;
};

export function Sidebar({
	user,
	sidebarOpen,
	setSidebarOpen,
	handleLogout,
	handleLinkClick,
}: SidebarProps) {
	const pathname = usePathname();
	const roleNavItems = navItems[user.role as keyof typeof navItems] || [];

	return (
		<aside
			className={cn(
				"fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300 ease-in-out",
				"border-white/10 bg-slate-900/80 backdrop-blur-lg",
				sidebarOpen ? "w-64" : "w-20"
			)}
		>
			<div
				className={cn(
					"flex h-16 items-center border-b border-white/10 px-4",
					sidebarOpen ? "justify-between" : "justify-center"
				)}
			>
				<Link
					href="/"
					className={cn(
						"font-bold text-xl whitespace-nowrap overflow-hidden transition-all duration-300",
						"bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent",
						sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
					)}
				>
					GradVerify
				</Link>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className="hover:bg-white/10 text-gray-400 hover:text-white rounded-full"
				>
					<ChevronLeft
						className={cn(
							"h-6 w-6 transition-transform duration-300",
							!sidebarOpen && "rotate-180"
						)}
					/>
				</Button>
			</div>

			<ScrollArea className="h-[calc(100vh-8rem)]">
				<nav className="grid items-start gap-2 p-4">
					{roleNavItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								prefetch={true}
								onClick={() => handleLinkClick(item.href)}
								className={cn(
									"group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ease-in-out",
									"hover:bg-white/10 hover:text-white",
									isActive
										? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-lg"
										: "text-gray-400",
									!sidebarOpen && "justify-center"
								)}
								title={!sidebarOpen ? item.title : ""}
							>
								<div className="relative flex-shrink-0">
									{item.icon}
									{isActive && (
										<div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-30 blur-md animate-pulse-glow" />
									)}
								</div>
								<span
									className={cn(
										"overflow-hidden whitespace-nowrap transition-all font-medium",
										sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
									)}
								>
									{item.title}
								</span>
							</Link>
						);
					})}
				</nav>
			</ScrollArea>
			<div className="absolute bottom-0 w-full p-4 border-t border-white/10">
				<Button
					variant="ghost"
					className={cn(
						"w-full justify-center gap-3 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg",
						!sidebarOpen && "p-2 h-auto"
					)}
					onClick={handleLogout}
				>
					<LogOut className="h-5 w-5" />
					<span
						className={cn(
							"overflow-hidden whitespace-nowrap transition-all font-medium",
							sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
						)}
					>
						Logout
					</span>
				</Button>
			</div>
		</aside>
	);
} 