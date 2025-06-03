"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  notSubmitted: number;
  total: number;
}

export default function FacultyOverviewPage() {
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, notSubmitted: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { getFacultyStats } = await import("@/actions/faculty-stats.actions");
        const data = await getFacultyStats();
        setStats(data.stats);
      } catch {
        setStats({ pending: 0, approved: 0, rejected: 0, notSubmitted: 0, total: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, Faculty!</h1>
        <p className="text-muted-foreground">Here is a summary of your verification activity.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold">{stats.pending}</span>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold text-green-600">{stats.approved}</span>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold text-red-600">{stats.rejected}</span>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Not Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold text-gray-500">{stats.notSubmitted}</span>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin" /> : <span className="text-3xl font-bold text-blue-600">{stats.total}</span>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 