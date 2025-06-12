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
			href: "/dashboard/superadmin/audit-logs",
			title: "Audit Logs",
			icon: <Shield className="w-4 h-4" />,
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
				"fixed left-0 top-0 z-40 h-screen border-r bg-gray-900 text-gray-200 transition-all duration-300 ease-in-out",
				sidebarOpen ? "w-64" : "w-20"
			)}
		>
			<div
				className={cn(
					"flex h-14 items-center border-b border-gray-700 px-4",
					sidebarOpen ? "justify-between" : "justify-center"
				)}
			>
				<Link
					href="/"
					className={cn(
						"font-bold text-lg whitespace-nowrap overflow-hidden transition-all",
						sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
					)}
				>
					GradVerify
				</Link>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className="hover:bg-gray-700"
				>
					<ChevronLeft
						className={cn(
							"h-5 w-5 transition-transform",
							!sidebarOpen && "rotate-180"
						)}
					/>
				</Button>
			</div>
			<ScrollArea className="h-[calc(100vh-8rem)]">
				<nav className="grid items-start gap-1 p-2">
					{roleNavItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							prefetch={true}
							onClick={() => handleLinkClick(item.href)}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 ease-in-out hover:bg-gray-700 hover:text-white",
								pathname === item.href
									? "bg-blue-600 text-white shadow-lg"
									: "text-gray-400",
								!sidebarOpen && "justify-center"
							)}
							title={!sidebarOpen ? item.title : ""}
						>
							<div className="flex-shrink-0">{item.icon}</div>
							<span
								className={cn(
									"overflow-hidden whitespace-nowrap transition-all",
									sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
								)}
							>
								{item.title}
							</span>
						</Link>
					))}
				</nav>
			</ScrollArea>
			<div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
				<Button
					variant="ghost"
					className={cn(
						"w-full justify-center gap-2 text-gray-400 hover:bg-gray-700 hover:text-white",
						!sidebarOpen && "p-2 h-auto"
					)}
					onClick={handleLogout}
				>
					<LogOut className="h-4 w-4" />
					<span
						className={cn(
							"overflow-hidden whitespace-nowrap transition-all",
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