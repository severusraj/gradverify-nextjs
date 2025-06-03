"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSuperadminAuditLogs } from "@/actions/superadmin-audit-logs.actions";
import { format } from "date-fns";

const actions = [
  "USER_CREATED", "USER_UPDATED", "USER_DELETED",
  "STUDENT_STATUS_UPDATED", "FILE_UPLOADED", "FILE_DELETED",
  "INVITATION_SENT", "APPROVE_DOCUMENT", "REJECT_DOCUMENT"
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [userId, action, startDate, endDate, page]);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const result = await getSuperadminAuditLogs({
        userId: userId.trim() || undefined,
        action: action || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: pageSize,
      });
      if (result.success) {
        setLogs(result.logs ?? []);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotal(result.pagination.total);
        }
      } else {
        setError(result.error || "Failed to fetch audit logs");
      }
    } catch {
      setError("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">System activity and security logs</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-xs mb-1">User ID</label>
              <Input value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" />
            </div>
            <div>
              <label className="block text-xs mb-1">Action</label>
              <select value={action} onChange={e => setAction(e.target.value)} className="border rounded px-2 py-1">
                <option value="">All</option>
                {actions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1">End Date</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <Button onClick={() => { setPage(1); fetchLogs(); }} variant="outline">Apply</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No audit logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                      <TableCell>
                        {log.user?.name || log.userId}
                        <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                        <div className="text-xs text-muted-foreground">{log.user?.role}</div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.targetId || "-"}</TableCell>
                      <TableCell>
                        <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded max-w-xs overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-2">{total} log entries</div>
        </CardContent>
      </Card>
    </div>
  );
} 