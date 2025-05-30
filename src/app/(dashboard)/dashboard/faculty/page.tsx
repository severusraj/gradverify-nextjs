"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Download } from "lucide-react";
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
		fetch("/api/faculty/stats")
			.then((res) => res.json())
			.then((data) => setStats(data.stats))
			.finally(() => setLoadingStats(false));

		fetch("/api/faculty/students?limit=5&sort=desc")
			.then((res) => res.json())
			.then((data) => setRecent(Array.isArray(data.data?.students) ? data.data.students : []))
			.finally(() => setLoadingRecent(false));
	}, []);

	// Fetch students on mount and when filters change
	useEffect(() => {
		fetch(`/api/faculty/students?page=${page}&pageSize=${pageSize}`)
			.then((res) => res.json())
			.catch((_err) => toast.error(_err.message || "Failed to load students"))
			.finally(() => setLoadingRecent(false));
	}, [page, pageSize]);

	const handleViewPSA = async (studentId: string) => {
		setPsaLoading(true);
		setPsaUrl(null);
		try {
			const res = await fetch(`/api/faculty/verification/file-url?studentId=${studentId}&type=psa`);
			if (!res.ok) throw new Error("Failed to fetch PSA file");
			const data = await res.json();
			setPsaUrl(data.url);
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
			const res = await fetch(`/api/faculty/verification/file-url?studentId=${studentId}&type=gradPhoto`);
			if (!res.ok) throw new Error("Failed to fetch Graduation Photo");
			const data = await res.json();
			setGradPhotoUrl(data.url);
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

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Faculty Dashboard</h1>
				<p className="text-muted-foreground">Overview of your verification activity and recent submissions.</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Pending</CardTitle>
						<CardDescription>Awaiting your review</CardDescription>
					</CardHeader>
					<CardContent>
						{loadingStats ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold">{stats.pending}</span>}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Approved</CardTitle>
						<CardDescription>Verified by you</CardDescription>
					</CardHeader>
					<CardContent>
						{loadingStats ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold text-green-600">{stats.approved}</span>}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Rejected</CardTitle>
						<CardDescription>Marked as not valid</CardDescription>
					</CardHeader>
					<CardContent>
						{loadingStats ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold text-red-600">{stats.rejected}</span>}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Not Submitted</CardTitle>
						<CardDescription>No submission yet</CardDescription>
					</CardHeader>
					<CardContent>
						{loadingStats ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold text-gray-500">{stats.notSubmitted}</span>}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Total Students</CardTitle>
						<CardDescription>All students</CardDescription>
					</CardHeader>
					<CardContent>
						{loadingStats ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold text-blue-600">{stats.total}</span>}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Submissions</CardTitle>
					<CardDescription>Latest students awaiting or recently processed</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingRecent ? (
						<div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
					) : recent.length === 0 ? (
						<div className="text-center text-muted-foreground py-8">No recent submissions.</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="px-2 py-1 text-left">Student ID</th>
										<th className="px-2 py-1 text-left">Name</th>
										<th className="px-2 py-1 text-left">Department</th>
										<th className="px-2 py-1 text-left">Program</th>
										<th className="px-2 py-1 text-left">Status</th>
										<th className="px-2 py-1 text-left">Action</th>
									</tr>
								</thead>
								<tbody>
									{recent.map((student) => (
										<tr key={student.id} className="border-b hover:bg-accent">
											<td className="px-2 py-1">{student.studentId}</td>
											<td className="px-2 py-1">{student.name}</td>
											<td className="px-2 py-1">{student.department}</td>
											<td className="px-2 py-1">{student.program}</td>
											<td className="px-2 py-1">
												<span className={
													student.status === "APPROVED"
														? "text-green-600"
														: student.status === "REJECTED"
														? "text-red-600"
														: "text-yellow-600"
												}>
													{student.status}
												</span>
											</td>
											<td className="px-2 py-1">
												<Button size="icon" variant="outline" onClick={() => setSelectedStudent(student)}>
													<Eye className="h-4 w-4" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
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
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Student Details</DialogTitle>
					</DialogHeader>
					{selectedStudent && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Student ID</p>
									<p>{selectedStudent.studentId}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Name</p>
									<p>{selectedStudent.name}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Department</p>
									<p>{selectedStudent.department}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Program</p>
									<p>{selectedStudent.program}</p>
								</div>
								{selectedStudent.psaFile && (
									<div className="col-span-2">
										<p className="text-sm font-medium">PSA Document</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewPSA(selectedStudent.id)}
											disabled={psaLoading}
											className="mb-2"
										>
											{psaLoading ? (
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
											) : (
												<Download className="h-4 w-4 mr-2" />
											)}
											View/Download PSA
										</Button>
										{psaUrl && (
											<div className="mt-2">
												<a
													href={psaUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline mr-4"
													download
												>
													Download PSA
												</a>
												{/* Preview if image */}
												<div className="mt-2">
													<Image src={psaUrl} alt="PSA Document" width={256} height={256} className="max-h-64 rounded border" />
												</div>
											</div>
										)}
									</div>
								)}
								{selectedStudent.gradPhoto && (
									<div className="col-span-2">
										<p className="text-sm font-medium">Graduation Photo</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewGradPhoto(selectedStudent.id)}
											disabled={gradPhotoLoading}
											className="mb-2"
										>
											{gradPhotoLoading ? (
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
											) : (
												<Download className="h-4 w-4 mr-2" />
											)}
											View/Download Photo
										</Button>
										{gradPhotoUrl && (
											<div className="mt-2">
												<a
													href={gradPhotoUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline mr-4"
													download
												>
													Download Photo
												</a>
												{/* Preview if image */}
												<div className="mt-2">
													<Image src={gradPhotoUrl} alt="Graduation Photo" width={256} height={256} className="max-h-64 rounded border" />
												</div>
											</div>
										)}
									</div>
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