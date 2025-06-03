import { getAdminDashboardData } from "@/actions/admin-dashboard.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

type DashboardData = {
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
};

export default async function DashboardPage() {
	const { success, data, message } = await getAdminDashboardData();

	if (!success || !data) {
		return (
			<div className="mx-auto max-w-6xl px-6 md:px-0 pt-6 pb-10">
				<div className="text-red-500">Error: {message}</div>
			</div>
		);
	}

	const dashboardData = data as DashboardData;

	return (
		<div className="mx-auto max-w-6xl px-6 md:px-0 pt-6 pb-10">
			<div className="mb-8">
				<h1 className="text-2xl font-bold">Dashboard</h1>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{dashboardData.totalSubmissions}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{dashboardData.pendingSubmissions}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Approved</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{dashboardData.approvedSubmissions}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Rejected</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{dashboardData.rejectedSubmissions}</div>
					</CardContent>
				</Card>
			</div>

			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
				<div className="rounded-md border">
					<div className="relative w-full overflow-auto">
						<table className="w-full caption-bottom text-sm">
							<thead className="[&_tr]:border-b">
								<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
									<th className="h-12 px-4 text-left align-middle font-medium">Student Name</th>
									<th className="h-12 px-4 text-left align-middle font-medium">Status</th>
									<th className="h-12 px-4 text-left align-middle font-medium">Submitted</th>
								</tr>
							</thead>
							<tbody className="[&_tr:last-child]:border-0">
								{dashboardData.recentSubmissions.map((submission) => (
									<tr key={submission.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
										<td className="p-4 align-middle">{submission.studentName}</td>
										<td className="p-4 align-middle">
											<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
												submission.status === "APPROVED" ? "bg-green-100 text-green-800" :
												submission.status === "REJECTED" ? "bg-red-100 text-red-800" :
												"bg-yellow-100 text-yellow-800"
											}`}>
												{submission.status}
											</span>
										</td>
										<td className="p-4 align-middle">
											{formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
