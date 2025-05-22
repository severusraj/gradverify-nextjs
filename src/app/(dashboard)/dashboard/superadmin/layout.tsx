"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SuperadminLogoutButton } from "@/components/superadmin-logout-button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
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
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold">Super Admin</span>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)] flex flex-col justify-between">
          <div className="space-y-1 p-2">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
          <div className="p-4 border-t">
            <SuperadminLogoutButton />
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-margin",
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
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ href, title, icon }: SidebarNavProps["items"][number]) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
      )}
    >
      {icon}
      {title}
    </Link>
  );
} 