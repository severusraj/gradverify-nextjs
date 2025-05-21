"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Users,
	Clock,
	CheckCircle,
	XCircle,
	ArrowUpRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useState } from "react";

// Real department data from student submissions
const departments = [
	{
		name: "College of Allied Health Studies (CAHS)",
		programs: [
			"BS in Nursing",
			"BS in Midwifery",
		],
	},
	{
		name: "College of Business and Accountancy (CBA)",
		programs: [
			"BS in Accountancy",
			"BS in Business Administration Major in Financial Management",
			"BS in Business Administration Major in Human Resource Management",
			"BS in Business Administration Major in Marketing Management",
			"BS in Customs Administration",
		],
	},
	{
		name: "College of Computer Studies (CCS)",
		programs: [
			"BS in Computer Science",
			"BS in Entertainment and Multimedia Computing",
			"BS in Information Technology",
		],
	},
	{
		name: "College of Education, Arts, and Sciences (CEAS)",
		programs: [
			"BA in Communication",
			"BS in Early Childhood Education",
			"BS in Culture and Arts Education",
			"BS in Physical Education",
			"BS in Elementary Education (General Education)",
			"BS in Secondary Education major in English",
			"BS in Secondary Education major in Filipino",
			"BS in Secondary Education major in Mathematics",
			"BS in Secondary Education major in Social Studies",
			"BS in Secondary Education major in Sciences",
		],
	},
	{
		name: "College of Hospitality and Tourism Management (CHTM)",
		programs: [
			"BS in Hospitality Management",
			"BS in Tourism Management",
		],
	},
];

// Placeholder data - replace with real data from your API
const recentSubmissions = [
	{
		id: 1,
		student: "John Doe",
		department: "College of Computer Studies (CCS)",
		type: "Graduation Requirements",
		status: "Pending",
		submittedAt: "2024-05-20T10:30:00",
	},
	{
		id: 2,
		student: "Jane Smith",
		department: "College of Business and Accountancy (CBA)",
		type: "Awards Verification",
		status: "Approved",
		submittedAt: "2024-05-20T09:15:00",
	},
	// Add more items as needed
];

export default function SuperAdminDashboard() {
	type DepartmentProgress = {
		name: string;
		pending: number;
		approved: number;
		total: number;
	};

	const [departmentProgress, setDepartmentProgress] = useState<DepartmentProgress[]>([]);

	useEffect(() => {
		setDepartmentProgress(
			departments.map(dept => {
				const pending = Math.floor(Math.random() * 20);
				const approved = Math.floor(Math.random() * 50);
				return {
					name: dept.name,
					pending,
					approved,
					total: pending + approved,
				};
			})
		);
	}, []);

	return (
		<div className="p-8 space-y-8">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold">Dashboard Overview</h1>
				<p className="text-muted-foreground">
					Welcome back! Here's what's happening in your system.
				</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">123</div>
						<p className="text-xs text-muted-foreground">
							+2 from last week
						</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">45</div>
						<p className="text-xs text-muted-foreground">
							5 new today
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Approved</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">284</div>
						<p className="text-xs text-muted-foreground">
							+12 this month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Rejected</CardTitle>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground">
							-2 from last week
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Recent Submissions */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Recent Submissions</CardTitle>
							<Button variant="ghost" size="sm" className="text-xs">
								View All
								<ArrowUpRight className="ml-1 h-3 w-3" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-[400px]">
							<div className="space-y-4">
								{recentSubmissions.map((submission) => (
									<div
										key={submission.id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div>
											<div className="font-medium">{submission.student}</div>
											<div className="text-sm text-muted-foreground">
												{submission.department} • {submission.type}
											</div>
										</div>
										<div className="flex items-center">
											<div className={`text-sm ${
												submission.status === "Approved" 
													? "text-green-600" 
													: "text-orange-600"
											}`}>
												{submission.status}
											</div>
											<div className="text-xs text-muted-foreground ml-4">
												{new Date(submission.submittedAt).toLocaleTimeString()}
											</div>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>
					</CardContent>
				</Card>

				{/* Department Progress */}
				<Card>
					<CardHeader>
						<CardTitle>Verification Progress by Department</CardTitle>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-[400px]">
							<div className="space-y-6">
								{departmentProgress.map((dept) => {
									const progress = (dept.approved / dept.total) * 100;
									return (
										<div key={dept.name} className="space-y-2">
											<div className="flex items-center justify-between">
												<div className="space-y-1">
													<div className="text-sm font-medium">{dept.name}</div>
													<div className="text-xs text-muted-foreground">
														{dept.pending} pending • {dept.approved} approved
													</div>
												</div>
												<div className="text-sm font-medium">{Math.round(progress)}%</div>
											</div>
											<div className="h-2 rounded-full bg-secondary">
												<div
													className="h-full rounded-full bg-primary"
													style={{ width: `${progress}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 