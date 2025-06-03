"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import {
  LayoutDashboard,
  User,
  Menu,
  LogOut,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logoutUser } from "@/actions/auth.actions";
import { toast } from "sonner";

const navItems = [
  {
    href: "/dashboard/faculty",
    title: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    href: "/dashboard/faculty/verification",
    title: "Verification",
    icon: <Check className="w-4 h-4" />,
  },
  {
    href: "/dashboard/faculty/profile",
    title: "Profile",
    icon: <User className="w-4 h-4" />,
  },
];

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 