"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import {
  LayoutDashboard,
  CheckCircle2,
  FileText,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logoutUser } from "@/actions/auth.actions";
import { toast } from "sonner";

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 