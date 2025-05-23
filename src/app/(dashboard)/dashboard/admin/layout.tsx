"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckCircle2,
  FileText,
  Menu,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logoutUser } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const navItems = [
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
  ];

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

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
          <span className="font-semibold">Admin Dashboard</span>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)] flex flex-col justify-between">
          <div className="space-y-1 p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  usePathname() === item.href && "bg-accent"
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
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
} 