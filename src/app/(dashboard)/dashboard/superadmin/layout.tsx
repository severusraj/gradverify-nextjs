"use client";

import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  Award,
  FileText,
  Settings,
  LineChart,
  Send,
  Shield,
} from "lucide-react";

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
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 