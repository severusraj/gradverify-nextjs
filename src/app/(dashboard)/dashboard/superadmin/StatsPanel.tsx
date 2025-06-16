import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, LucideIcon } from "lucide-react";
import { getSuperadminDashboardCounts } from "@/actions/superadmin-dashboard.actions";

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

export default async function StatsPanel() {
  const { success, counts } = await getSuperadminDashboardCounts();

  if (!success || !counts) {
    return <div className="p-6 text-red-500">Failed to load statistics</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard title="Total Students" value={counts.totalStudents} icon={Users} />
      <StatCard title="Total Admins" value={counts.totalAdmins} icon={UserCheck} />
      <StatCard title="Pending Submissions" value={counts.pendingSubmissions} icon={Clock} />
    </div>
  );
} 