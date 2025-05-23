"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Submission {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
  overallStatus: string;
  createdAt: string;
  psaStatus: string;
  awardStatus: string;
}

export default function VerificationPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/admin/verification", window.location.origin);
        url.searchParams.set("search", searchQuery);
        url.searchParams.set("status", statusFilter);
        const response = await fetch(url.toString());
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch submissions");
        }
        setSubmissions(data.data);
      } catch (err: any) {
        setError(err.message || "Failed to load submissions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [searchQuery, statusFilter]); // Refetch when search or status changes

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedSubmissions.length === 0) {
      toast.error("Please select at least one submission");
      return;
    }

    try {
      const response = await fetch(`/api/admin/verification/bulk-${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedSubmissions }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} submissions`);
      }

      toast.success(`Successfully ${action}d ${selectedSubmissions.length} submissions`);
      setSelectedSubmissions([]);
      // Refresh the submissions list
      const url = new URL("/api/admin/verification", window.location.origin);
      url.searchParams.set("search", searchQuery);
      url.searchParams.set("status", statusFilter);
      const updatedResponse = await fetch(url.toString());
      const updatedData = await updatedResponse.json();
      setSubmissions(updatedData.data);
    } catch (err: any) {
      toast.error(`Failed to ${action} submissions`);
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map((s) => s.id));
    }
  };

  const toggleSelectSubmission = (id: string) => {
    setSelectedSubmissions((prev) =>
      prev.includes(id)
        ? prev.filter((submissionId) => submissionId !== id)
        : [...prev, id]
    );
  };

  if (loading) return <div>Loading submissions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Verification</h1>
          <p className="text-muted-foreground">
            Review and verify student submissions
          </p>
        </div>
        {selectedSubmissions.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("approve")}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("reject")}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject Selected
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Submissions</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                onCheckedChange={toggleSelectAll}
                disabled={submissions.length === 0}
              />
              <span className="text-sm text-muted-foreground">
                Select All
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedSubmissions.includes(submission.id)}
                      onCheckedChange={() => toggleSelectSubmission(submission.id)}
                    />
                    <div>
                      <p className="font-medium">{submission.user?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.user?.email || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            submission.psaStatus === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : submission.psaStatus === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          PSA: {submission.psaStatus}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            submission.awardStatus === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : submission.awardStatus === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          Award: {submission.awardStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/admin/verification/${submission.id}`}
                  >
                    Review
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">No submissions found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 