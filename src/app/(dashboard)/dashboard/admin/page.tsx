"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Users, Award } from "lucide-react";

interface DashboardStats {
	totalSubmissions: number;
	pendingSubmissions: number;
	approvedSubmissions: number;
	rejectedSubmissions: number;
	recentSubmissions: Array<{
		id: string;
		studentName: string;
		status: string;
		createdAt: string;
	}>;
}

export default function AdminDashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch("/api/admin/dashboard");
				const data = await response.json();
				setStats(data);
			} catch (err) {
				setError("Failed to load dashboard data");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (loading) return <div>Loading dashboard...</div>;
	if (error) return <div className="text-red-500">{error}</div>;
	if (!stats) return <div>No data available</div>;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of student submissions and verification status
				</p>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
						<FileCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalSubmissions}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Approved</CardTitle>
						<Award className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.approvedSubmissions}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Rejected</CardTitle>
						<FileCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.rejectedSubmissions}</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Submissions */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Submissions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{stats.recentSubmissions.map((submission) => (
							<div
								key={submission.id}
								className="flex items-center justify-between border-b pb-2"
							>
								<div>
									<p className="font-medium">{submission.studentName}</p>
									<p className="text-sm text-muted-foreground">
										{new Date(submission.createdAt).toLocaleDateString()}
									</p>
								</div>
								<div
									className={`px-2 py-1 rounded-full text-xs ${
										submission.status === "APPROVED"
											? "bg-green-100 text-green-800"
											: submission.status === "REJECTED"
											? "bg-red-100 text-red-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{submission.status}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 