import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSuperadminAnalyticsSummary } from "@/actions/superadmin-analytics.actions";

export default async function SummaryPanel() {
  const { success, summary } = await getSuperadminAnalyticsSummary();

  if (!success || !summary) {
    return <div className="p-6 text-red-500">Failed to load summary</div>;
  }

  const { totalSubmissions, approvalRate, avgProcessingTime, activeVerifiers } = summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalSubmissions.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Total verification requests</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Approval Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{approvalRate.toFixed(1)}%</div>
          <p className="text-xs text-gray-500">% of requests approved</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Avg. Processing Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{avgProcessingTime ? avgProcessingTime.toFixed(1) : "N/A"} days</div>
          <p className="text-xs text-gray-500">Across all document types</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Active Verifiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeVerifiers}</div>
          <p className="text-xs text-gray-500">Admins/faculty in last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
} 