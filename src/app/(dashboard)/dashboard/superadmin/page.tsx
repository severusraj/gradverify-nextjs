"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Award, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Analytics {
	userStats: {
		[key: string]: number;
	};
	verificationStats: {
		[key: string]: number;
	};
	departmentStats: {
		[key: string]: number;
	};
	recentActivity: Array<{
		id: string;
		action: string;
		createdAt: string;
		user: {
			name: string;
			email: string;
			role: string;
		};
	}>;
}

export default function SuperAdminDashboard() {
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api/superadmin/analytics")
			.then(res => res.json())
			.then(data => {
				console.log("Analytics data:", data);
				setAnalytics(data.data);
				setLoading(false);
			})
			.catch(err => {
				console.error("Error fetching analytics:", err);
				setError("Failed to load analytics data");
				setLoading(false);
			});
	}, []);

	if (loading) return <div className="p-8">Loading analytics...</div>;
	if (error) return <div className="p-8 text-red-600">{error}</div>;
	if (!analytics) return <div className="p-8">No analytics data available</div>;

	const totalUsers = Object.values(analytics.userStats).reduce((a, b) => a + b, 0);
	const totalVerifications = Object.values(analytics.verificationStats).reduce((a, b) => a + b, 0);

	return (
		<div className="p-8 space-y-8">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of system statistics and recent activity
				</p>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers}</div>
						<p className="text-xs text-muted-foreground">
							{Object.entries(analytics.userStats)
								.map(([role, count]) => `${count} ${role.toLowerCase()}s`)
								.join(', ')}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Verification Requests</CardTitle>
						<FileCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalVerifications}</div>
						<p className="text-xs text-muted-foreground">
							{analytics.verificationStats.PENDING || 0} pending, {analytics.verificationStats.APPROVED || 0} approved, {analytics.verificationStats.REJECTED || 0} rejected
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Departments</CardTitle>
						<Award className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{Object.keys(analytics.departmentStats).length}
						</div>
						<p className="text-xs text-muted-foreground">
							Active departments with students
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.recentActivity.length}
						</div>
						<p className="text-xs text-muted-foreground">
							Actions in the last 30 days
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[400px]">
						<div className="space-y-4">
							{analytics.recentActivity.map((activity) => (
								<div key={activity.id} className="flex items-center justify-between">
									<div>
										<p className="font-medium">{activity.user.name}</p>
										<p className="text-sm text-muted-foreground">{activity.action}</p>
									</div>
									<div className="text-sm text-muted-foreground">
										{new Date(activity.createdAt).toLocaleString()}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>

			{/* Department Distribution */}
			<Card>
				<CardHeader>
					<CardTitle>Department Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Object.entries(analytics.departmentStats).map(([dept, count]) => (
							<div key={dept} className="flex items-center justify-between">
								<div className="font-medium">{dept}</div>
								<div className="text-sm text-muted-foreground">{count} students</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 