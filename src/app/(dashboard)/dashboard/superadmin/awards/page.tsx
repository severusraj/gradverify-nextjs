"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, Search, Plus, MoreHorizontal, FileCheck, Loader2, FileText, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getSignedDownloadUrl } from "@/lib/s3";

export default function AwardsManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<any | null>(null);
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isAwardViewModalOpen, setIsAwardViewModalOpen] = useState(false);
  const [awardViewUrl, setAwardViewUrl] = useState<string | null>(null);
  const [awardFileType, setAwardFileType] = useState<"image" | "pdf" | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/superadmin/students?hasAwards=true")
      .then(res => res.json())
      .then(data => {
        setStudents(data.data?.students || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load students with awards");
        setLoading(false);
      });
  }, []);

  // Filtering and pagination
  const filtered = students.filter(s => {
    const matchesSearch =
      !search ||
      (s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.includes(search));
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Approve/Reject handler
  async function handleAction() {
    if (!selected) return;
    setSubmitting(true);
    const res = await fetch(`/api/superadmin/students/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: action,
        rejectionReason: action === "REJECT" ? feedback : undefined,
      }),
    });
    if (res.ok) {
      toast.success(`Student ${action === "APPROVE" ? "approved" : "rejected"}`);
      setStudents(students => students.map(s => s.id === selected.id ? { ...s, status: action } : s));
      setSelected(null);
      setAction(null);
      setFeedback("");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update status");
    }
    setSubmitting(false);
  }

  function getFileIcon(key: string) {
    if (key.endsWith(".pdf")) return <FileText className="w-4 h-4 inline mr-1 text-muted-foreground" />;
    if (key.match(/\.(jpg|jpeg|png)$/i)) return <ImageIcon className="w-4 h-4 inline mr-1 text-muted-foreground" />;
    return null;
  }

  function getStatusBadge(status: string) {
    if (status === "APPROVED") return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    if (status === "REJECTED") return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
  }

  async function handleViewAward(id: string, key: string) {
    setViewLoading(true);
    setAwardViewUrl(null);
    setAwardFileType(null);
    setIsAwardViewModalOpen(true); // Open modal immediately
    try {
      const res = await fetch(`/api/superadmin/awards/view-url?key=${encodeURIComponent(key)}`);
      const data = await res.json();

      console.log("Award view URL response data received by frontend:", data);

      const isResponseOk = res.ok;
      const receivedUrl = data.data?.url;

      console.log("Checking response status and URL:", { isResponseOk, receivedUrl });

      if (isResponseOk && receivedUrl) {
        setAwardViewUrl(receivedUrl);
        // Determine file type from key
        if (key.match(/\.(jpg|jpeg|png)$/i)) {
          setAwardFileType("image");
        } else if (key.endsWith(".pdf")) {
          setAwardFileType("pdf");
        } else {
           setAwardFileType(null); // Fallback or unsupported type
        }

        console.log("Award file type and URL:", { awardFileType, url: receivedUrl });

      } else {
        toast.error(data.error || "Failed to get award view link");
        setIsAwardViewModalOpen(false); // Close modal on error
      }
    } catch (error) {
      console.error("Error fetching award view URL:", error);
      toast.error("Failed to get award view link");
      setIsAwardViewModalOpen(false); // Close modal on error
    } finally {
      setViewLoading(false);
    }
  }

  async function handleDownloadAward(key: string) {
    setDownloadLoading(true);
    try {
      const res = await fetch(`/api/superadmin/awards/download?key=${encodeURIComponent(key)}`);
      const data = await res.json();

      if (res.ok && data.data?.url) {
        // Use the signed URL to trigger download in a new tab
        const link = document.createElement('a');
        link.href = data.data.url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(data.error || "Failed to download award");
      }
    } catch (error) {
      console.error("Error downloading award:", error);
      toast.error("Failed to download award");
    } finally {
      setDownloadLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Awards Review</h1>
          <p className="text-muted-foreground">Review and approve student-submitted awards</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Search by name, email, or student ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student Awards</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-red-600 py-8">{error}</div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Award File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No students with uploaded awards found
                      </TableCell>
                    </TableRow>
                  ) : paginated.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/40 transition">
                      <TableCell>{student.user?.name || student.studentId}</TableCell>
                      <TableCell>{student.user?.email || "-"}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>
                        {student.awardsS3Key ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAward(student.id, student.awardsS3Key)}
                              disabled={viewLoading}
                              className="mr-2"
                            >
                              {viewLoading ? "Loading..." : "View"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAward(student.awardsS3Key)}
                              disabled={downloadLoading}
                            >
                              {downloadLoading ? "Downloading..." : "Download"}
                            </Button>
                          </>
                        ) : (
                          <span className="text-muted-foreground">No file</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>
                        {student.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50"
                              onClick={() => { setSelected(student); setAction("APPROVE"); }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-700 border-red-300 hover:bg-red-50"
                              onClick={() => { setSelected(student); setAction("REJECT"); }}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Approve/Reject Dialog */}
      <Dialog open={!!action} onOpenChange={() => { setAction(null); setSelected(null); setFeedback(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{action === "APPROVE" ? "Approve Award" : "Reject Award"}</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <div className="mb-2 font-medium">Student: {selected?.user?.name || selected?.studentId}</div>
            <div className="mb-2 text-sm text-muted-foreground">Award file: {selected?.awardsS3Key}</div>
            {action === "REJECT" && (
              <div>
                <label className="block text-sm font-medium mb-1">Feedback (optional)</label>
                <Input value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Reason for rejection..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAction(null); setSelected(null); setFeedback(""); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={submitting}
              className={action === "APPROVE" ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"}
            >
              {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
              {action === "APPROVE" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Award View Modal */}
      <Dialog open={isAwardViewModalOpen} onOpenChange={setIsAwardViewModalOpen}>
        <DialogContent className="max-w-3xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>View Award</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {!awardViewUrl && viewLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
              </div>
            ) : awardViewUrl ? (
              awardFileType === "image" ? (
                <img src={awardViewUrl} alt="Award Document" className="max-w-full h-auto mx-auto" />
              ) : awardFileType === "pdf" ? (
                <iframe src={awardViewUrl} title="Award Document" className="w-full h-[60vh]"></iframe>
              ) : (
                <div className="text-red-600">Unsupported file type for viewing.</div>
              )
            ) : (
              <div className="text-muted-foreground text-center">No award file to display.</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAwardViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 