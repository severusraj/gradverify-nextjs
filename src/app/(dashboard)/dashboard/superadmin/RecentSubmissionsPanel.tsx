import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getSuperadminRecentSubmissions } from "@/actions/superadmin-dashboard.actions";

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
  if (status === "REJECTED") return <Badge className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
}

export default async function RecentSubmissionsPanel() {
  const { success, submissions } = await getSuperadminRecentSubmissions();

  if (!success || !submissions) {
    return <div className="p-6 text-red-500">Failed to load recent submissions</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Submissions</CardTitle>
        <CardDescription>Latest student submissions across all departments</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission: any) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.user?.name ?? "—"}</TableCell>
                  <TableCell>{submission.user?.email ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={submission.overallStatus} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 