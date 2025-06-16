"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Eye, Loader2, Download, FileText, GraduationCap, Clock, CheckCircle, XCircle, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";

// Define types
interface Stats {
	pending: number;
	approved: number;
	rejected: number;
	notSubmitted: number;
	total: number;
}

interface Student {
	id: string;
	name: string;
	email: string;
	studentId: string;
	department: string;
	program: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	psaFile?: string;
	gradPhoto?: string;
	awards?: string[];
	createdAt?: string;
}

const StatCard = ({ title, value, description, icon: Icon, loading, color }: {
	title: string;
	value: number;
	description: string;
	icon: any;
	loading: boolean;
	color: string;
}) => (
	<Card className="relative overflow-hidden">
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">{title}</CardTitle>
			<Icon className={`h-4 w-4 ${color}`} />
		</CardHeader>
		<CardContent>
			<div className={`text-2xl font-bold ${color}`}>
				{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
			</div>
			<p className="text-xs text-muted-foreground">{description}</p>
		</CardContent>
	</Card>
);

export default function FacultyDashboardPage() {
	const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, notSubmitted: 0, total: 0 });
	const [recent, setRecent] = useState<Student[]>([]);
	const [loadingStats, setLoadingStats] = useState(true);
	const [loadingRecent, setLoadingRecent] = useState(true);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [pageSize] = useState(20);
	const [psaUrl, setPsaUrl] = useState<string | null>(null);
	const [psaLoading, setPsaLoading] = useState(false);
	const [gradPhotoUrl, setGradPhotoUrl] = useState<string | null>(null);
	const [gradPhotoLoading, setGradPhotoLoading] = useState(false);
	const [page] = useState(1);

	// Fetch stats and recent submissions on mount
	useEffect(() => {
		(async () => {
			const { getFacultyStats } = await import("@/actions/faculty-stats.actions");
			const { getFacultyStudents } = await import("@/actions/faculty-students.actions");
			const statsData = await getFacultyStats();
			setStats(statsData.stats);
			const studentsData = await getFacultyStudents({ pageSize: 5, sort: "desc" });
			setRecent(Array.isArray(studentsData.students) ? studentsData.students : []);
			setLoadingStats(false);
			setLoadingRecent(false);
		})();
	}, []);

	// Fetch students on mount and when filters change
	useEffect(() => {
		(async () => {
			const { getFacultyStudents } = await import("@/actions/faculty-students.actions");
			await getFacultyStudents({ page, pageSize });
			setLoadingRecent(false);
		})();
	}, [page, pageSize]);

	const handleViewPSA = async (studentId: string) => {
		setPsaLoading(true);
		setPsaUrl(null);
		try {
			const { getFacultyVerificationFileUrl } = await import("@/actions/faculty-verification.actions");
			const data = await getFacultyVerificationFileUrl(studentId, "psa");
			if (!data.success) throw new Error(data.message || "Failed to fetch PSA file");
			setPsaUrl(data.url ?? null);
		} catch (err: unknown) {
			if (err instanceof Error) {
				toast.error(err.message || "Failed to fetch PSA file");
			} else {
				toast.error("Failed to fetch PSA file");
			}
		} finally {
			setPsaLoading(false);
		}
	};

	const handleViewGradPhoto = async (studentId: string) => {
		setGradPhotoLoading(true);
		setGradPhotoUrl(null);
		try {
			const { getFacultyVerificationFileUrl } = await import("@/actions/faculty-verification.actions");
			const data = await getFacultyVerificationFileUrl(studentId, "gradPhoto");
			if (!data.success) throw new Error(data.message || "Failed to fetch Graduation Photo");
			setGradPhotoUrl(data.url ?? null);
		} catch (err: unknown) {
			if (err instanceof Error) {
				toast.error(err.message || "Failed to fetch Graduation Photo");
			} else {
				toast.error("Failed to fetch Graduation Photo");
			}
		} finally {
			setGradPhotoLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "APPROVED":
				return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
					<CheckCircle className="h-3 w-3 mr-1" />
					Approved
				</Badge>;
			case "REJECTED":
				return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
					<XCircle className="h-3 w-3 mr-1" />
					Rejected
				</Badge>;
			case "PENDING":
				return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
					<Clock className="h-3 w-3 mr-1" />
					Pending
				</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<div className="space-y-8 p-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
				<p className="text-muted-foreground">Monitor verification activity and manage student submissions</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				<StatCard
					title="Pending Reviews"
					value={stats.pending}
					description="Awaiting your review"
					icon={Clock}
					loading={loadingStats}
					color="text-yellow-600"
				/>
				<StatCard
					title="Approved"
					value={stats.approved}
					description="Verified documents"
					icon={CheckCircle}
					loading={loadingStats}
					color="text-green-600"
				/>
				<StatCard
					title="Rejected"
					value={stats.rejected}
					description="Rejected documents"
					icon={XCircle}
					loading={loadingStats}
					color="text-red-600"
				/>
				<StatCard
					title="Not Submitted"
					value={stats.notSubmitted}
					description="No submission yet"
					icon={AlertCircle}
					loading={loadingStats}
					color="text-gray-500"
				/>
				<StatCard
					title="Total Students"
					value={stats.total}
					description="All registered students"
					icon={Users}
					loading={loadingStats}
					color="text-blue-600"
				/>
			</div>

			{/* Recent Submissions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Recent Submissions
					</CardTitle>
					<CardDescription>Latest student submissions requiring attention</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingRecent ? (
						<div className="flex justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : recent.length === 0 ? (
						<div className="text-center text-muted-foreground py-12">
							<FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
							<p className="text-lg font-medium">No recent submissions</p>
							<p className="text-sm">New student submissions will appear here</p>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="font-semibold">Student ID</TableHead>
										<TableHead className="font-semibold">Name</TableHead>
										<TableHead className="font-semibold">Department</TableHead>
										<TableHead className="font-semibold">Program</TableHead>
										<TableHead className="font-semibold">Status</TableHead>
										<TableHead className="font-semibold">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recent.map((student) => (
										<TableRow key={student.id} className="hover:bg-muted/50">
											<TableCell className="font-mono text-sm">{student.studentId}</TableCell>
											<TableCell className="font-medium">{student.name}</TableCell>
											<TableCell>
												<Badge variant="outline" className="font-normal">
													{student.department}
												</Badge>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">{student.program}</TableCell>
											<TableCell>{getStatusBadge(student.status)}</TableCell>
											<TableCell>
												<Button 
													size="sm" 
													variant="outline" 
													onClick={() => setSelectedStudent(student)}
													className="h-8 px-3"
												>
													<Eye className="h-4 w-4 mr-1" />
													View
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Student Details Modal */}
			<Dialog open={!!selectedStudent} onOpenChange={() => {
				setSelectedStudent(null);
				setPsaUrl(null);
				setGradPhotoUrl(null);
				setPsaLoading(false);
				setGradPhotoLoading(false);
			}}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<GraduationCap className="h-5 w-5" />
							Student Details
						</DialogTitle>
					</DialogHeader>
					{selectedStudent && (
						<div className="space-y-6">
							{/* Student Info Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">Student ID</p>
									<p className="font-mono font-medium">{selectedStudent.studentId}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">Full Name</p>
									<p className="font-medium">{selectedStudent.name}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">Department</p>
									<Badge variant="outline">{selectedStudent.department}</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">Program</p>
									<p>{selectedStudent.program}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">Status</p>
									{getStatusBadge(selectedStudent.status)}
								</div>
							</div>

							{/* Documents Section */}
							<div className="space-y-4">
								{selectedStudent.psaFile && (
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-lg flex items-center gap-2">
												<FileText className="h-4 w-4" />
												PSA Birth Certificate
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<Button
												variant="outline"
												onClick={() => handleViewPSA(selectedStudent.id)}
												disabled={psaLoading}
												className="w-full sm:w-auto"
											>
												{psaLoading ? (
													<Loader2 className="h-4 w-4 animate-spin mr-2" />
												) : (
													<Download className="h-4 w-4 mr-2" />
												)}
												View/Download PSA
											</Button>
											{psaUrl && (
												<div className="space-y-3">
													<a
														href={psaUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 hover:underline font-medium"
														download
													>
														Download Original File
													</a>
													<div className="border rounded-lg p-2 bg-muted/20">
														<Image 
															src={psaUrl} 
															alt="PSA Document" 
															width={400} 
															height={300} 
															className="max-h-64 w-auto rounded border mx-auto" 
														/>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								)}

								{selectedStudent.gradPhoto && (
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-lg flex items-center gap-2">
												<GraduationCap className="h-4 w-4" />
												Graduation Photo
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<Button
												variant="outline"
												onClick={() => handleViewGradPhoto(selectedStudent.id)}
												disabled={gradPhotoLoading}
												className="w-full sm:w-auto"
											>
												{gradPhotoLoading ? (
													<Loader2 className="h-4 w-4 animate-spin mr-2" />
												) : (
													<Download className="h-4 w-4 mr-2" />
												)}
												View/Download Photo
											</Button>
											{gradPhotoUrl && (
												<div className="space-y-3">
													<a
														href={gradPhotoUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 hover:underline font-medium"
														download
													>
														Download Original Photo
													</a>
													<div className="border rounded-lg p-2 bg-muted/20">
														<Image 
															src={gradPhotoUrl} 
															alt="Graduation Photo" 
															width={400} 
															height={300} 
															className="max-h-64 w-auto rounded border mx-auto" 
														/>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								)}
							</div>

							<DialogFooter>
								<Button variant="outline" onClick={() => setSelectedStudent(null)}>
									Close
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
} 