import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	FileCheck,
	Users,
	Clock,
	CheckCircle,
	XCircle,
	TrendingUp,
	LucideIcon,
} from "lucide-react";
import { getAdminDashboardData } from "@/actions/admin-dashboard.actions";

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

// ————————————————————
// Shared, non-interactive UI blocks
// ————————————————————
const StatCard = ({
	title,
	value,
	description,
	icon: Icon,
	color,
}: {
	title: string;
	value: number;
	description: string;
	icon: LucideIcon;
	color: string;
}) => (
	<Card className="relative overflow-hidden">
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">{title}</CardTitle>
			<Icon className={`h-4 w-4 ${color}`} />
		</CardHeader>
		<CardContent>
			<div className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</div>
			<p className="text-xs text-muted-foreground">{description}</p>
		</CardContent>
	</Card>
);

function getStatusBadge(status: string) {
	switch (status) {
		case "APPROVED":
			return (
				<Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
					<CheckCircle className="h-3 w-3 mr-1" /> Approved
				</Badge>
			);
		case "REJECTED":
			return (
				<Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
					<XCircle className="h-3 w-3 mr-1" /> Rejected
				</Badge>
			);
		case "PENDING":
			return (
				<Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
					<Clock className="h-3 w-3 mr-1" /> Pending
				</Badge>
			);
		default:
			return <Badge variant="outline">{status}</Badge>;
	}
}

export default async function AdminDashboard() {
	// Fetch data on the server — this is cached for 5 minutes in the action.
	const { success, data } = await getAdminDashboardData();

	if (!success || !data) {
		return (
			<div className="p-6 text-center text-red-500">
				Failed to load dashboard data.
			</div>
		);
	}

	const stats: DashboardStats = data;
	const total = stats.totalSubmissions;
	const pendingPercentage = total ? ((stats.pendingSubmissions / total) * 100).toFixed(1) : "0";
	const approvalRate = total ? ((stats.approvedSubmissions / total) * 100).toFixed(1) : "0";

	return (
		<div className="space-y-8 p-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
				<p className="text-muted-foreground">
					Comprehensive overview of student submissions and verification status
				</p>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Submissions"
					value={stats.totalSubmissions}
					description="All student submissions"
					icon={FileCheck}
					color="text-blue-600"
				/>
				<StatCard
					title="Pending Reviews"
					value={stats.pendingSubmissions}
					description={`${pendingPercentage}% of total submissions`}
					icon={Clock}
					color="text-yellow-600"
				/>
				<StatCard
					title="Approved"
					value={stats.approvedSubmissions}
					description={`${approvalRate}% approval rate`}
					icon={CheckCircle}
					color="text-green-600"
				/>
				<StatCard
					title="Rejected"
					value={stats.rejectedSubmissions}
					description="Documents requiring resubmission"
					icon={XCircle}
					color="text-red-600"
				/>
			</div>

			{/* System Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" /> System Overview
					</CardTitle>
					<CardDescription>Current verification system performance</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
						<div className="space-y-2">
							<p className="text-2xl font-bold text-blue-600">{total}</p>
							<p className="text-sm text-muted-foreground">Total Submissions</p>
						</div>
						<div className="space-y-2">
							<p className="text-2xl font-bold text-green-600">{approvalRate}%</p>
							<p className="text-sm text-muted-foreground">Approval Rate</p>
						</div>
						<div className="space-y-2">
							<p className="text-2xl font-bold text-yellow-600">{pendingPercentage}%</p>
							<p className="text-sm text-muted-foreground">Pending Review</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recent Submissions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" /> Recent Submissions
					</CardTitle>
					<CardDescription>Latest student submissions requiring attention</CardDescription>
				</CardHeader>
				<CardContent>
					{stats.recentSubmissions.length === 0 ? (
						<div className="text-center text-muted-foreground py-12">
							<Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
							<p className="text-lg font-medium">No recent submissions</p>
							<p className="text-sm">New submissions will appear here</p>
						</div>
					) : (
						<div className="rounded-md border overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="font-semibold">Student Name</TableHead>
										<TableHead className="font-semibold">Submission Date</TableHead>
										<TableHead className="font-semibold">Status</TableHead>
										<TableHead className="font-semibold">Days Ago</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{stats.recentSubmissions.map((submission) => {
										const submissionDate = new Date(submission.createdAt);
										const daysAgo = Math.floor(
											(Date.now() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
										);

										return (
											<TableRow key={submission.id} className="hover:bg-muted/50">
												<TableCell className="font-medium">{submission.studentName}</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{submissionDate.toLocaleDateString("en-US", {
														year: "numeric",
														month: "short",
														day: "numeric",
													})}
												</TableCell>
												<TableCell>{getStatusBadge(submission.status)}</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{daysAgo === 0
														? "Today"
														: daysAgo === 1
														? "1 day ago"
														: `${daysAgo} days ago`}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
} 