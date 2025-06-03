"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSuperadminDashboardStats } from "@/actions/superadmin-dashboard.actions";
import { Loader2, Users, UserCheck, UserX, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SuperadminDashboard() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [stats, setStats] = useState<any>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const result = await getSuperadminDashboardStats();
				if (result.success) {
					setStats(result.stats);
				} else {
					setError(result.error || "Failed to fetch dashboard stats");
				}
			} catch (error) {
				console.error("Error fetching dashboard stats:", error);
				setError("Failed to fetch dashboard stats");
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<div className="text-red-600">{error}</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-8">
			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Students</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Admins</CardTitle>
						<UserCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalAdmins || 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
						<UserX className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.pendingSubmissions || 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Recent Awards</CardTitle>
						<Award className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.recentAwards?.length || 0}</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Submissions */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Submissions</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[300px]">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Student</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{stats?.recentSubmissions?.map((submission: any) => (
									<TableRow key={submission.id}>
										<TableCell>{submission.user?.name}</TableCell>
										<TableCell>{submission.user?.email}</TableCell>
										<TableCell>
											<Badge
												className={
													submission.overallStatus === "APPROVED"
														? "bg-green-100 text-green-800 border-green-200"
														: submission.overallStatus === "REJECTED"
														? "bg-red-100 text-red-800 border-red-200"
														: "bg-yellow-100 text-yellow-800 border-yellow-200"
												}
											>
												{submission.overallStatus}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ScrollArea>
				</CardContent>
			</Card>

			{/* Recent Awards */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Awards</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[300px]">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Student</TableHead>
									<TableHead>Program</TableHead>
									<TableHead>Award</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{stats?.recentAwards?.map((award: any) => (
									<TableRow key={award.id}>
										<TableCell>{award.student?.name}</TableCell>
										<TableCell>{award.student?.studentProfile?.program}</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="font-medium">{award.name}</div>
												<div className="text-sm text-muted-foreground">{award.description}</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												className={
													award.status === "APPROVED"
														? "bg-green-100 text-green-800 border-green-200"
														: award.status === "REJECTED"
														? "bg-red-100 text-red-800 border-red-200"
														: "bg-yellow-100 text-yellow-800 border-yellow-200"
												}
											>
												{award.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
} 