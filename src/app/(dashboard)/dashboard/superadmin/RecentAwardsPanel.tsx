import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getSuperadminRecentAwards } from "@/actions/superadmin-dashboard.actions";

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
  if (status === "REJECTED") return <Badge className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
}

export default async function RecentAwardsPanel() {
  const { success, awards } = await getSuperadminRecentAwards();

  if (!success || !awards) {
    return <div className="p-6 text-red-500">Failed to load recent awards</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Awards</CardTitle>
        <CardDescription>Most recently submitted awards</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border">
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
              {awards.map((award: any) => (
                <TableRow key={award.id}>
                  <TableCell>{award.student?.name ?? "—"}</TableCell>
                  <TableCell>{award.student?.studentProfile?.program ?? "—"}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{award.name}</div>
                      {award.description && (
                        <div className="text-sm text-muted-foreground">{award.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={award.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 