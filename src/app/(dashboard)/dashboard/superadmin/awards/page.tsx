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
import { Loader2, FileText, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getAwardViewUrl, getAwardDownloadUrl, getSuperadminAwards, updateAwardStatus } from "@/actions/superadmin-awards.actions";

export default function AwardsManagement() {
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
  const [totalPages, setTotalPages] = useState(1);
  const [awards, setAwards] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const result = await getSuperadminAwards({ page, limit: pageSize });
      if (result.success) {
        setAwards(result.awards || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setLoading(false);
      } else {
        setError("Failed to load awards");
        setLoading(false);
      }
    })();
  }, [page, pageSize]);

  // Filtering and pagination
  const filtered = awards.filter(a => {
    const matchesSearch =
      !search ||
      (a.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.student?.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.student?.studentProfile?.studentId?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginated = filtered;

  // Approve/Reject handler
  async function handleAction() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const result = await updateAwardStatus({
        awardId: selected.id,
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        feedback: action === "REJECT" ? feedback : undefined
      });

      if (result.success) {
        toast.success(`Award ${action === "APPROVE" ? "approved" : "rejected"}`);
        setAwards(awards => awards.map(a => 
          a.id === selected.id ? { ...a, status: action === "APPROVE" ? "APPROVED" : "REJECTED" } : a
        ));
        setSelected(null);
        setAction(null);
        setFeedback("");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating award status:", error);
      toast.error("Failed to update status");
    } finally {
      setSubmitting(false);
    }
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
    setIsAwardViewModalOpen(true);
    try {
      const result = await getAwardViewUrl(key);
      if (result.success && result.url) {
        setAwardViewUrl(result.url);
        if (key.match(/\.(jpg|jpeg|png)$/i)) {
          setAwardFileType("image");
        } else if (key.endsWith(".pdf")) {
          setAwardFileType("pdf");
        } else {
          setAwardFileType(null);
        }
      } else {
        toast.error(result.error || "Failed to get award view link");
        setIsAwardViewModalOpen(false);
      }
    } catch (error) {
      console.error("Error fetching award view URL:", error);
      toast.error("Failed to get award view link");
      setIsAwardViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  }

  async function handleDownloadAward(key: string) {
    setDownloadLoading(true);
    try {
      const result = await getAwardDownloadUrl(key);
      if (result.success && result.url) {
        const link = document.createElement('a');
        link.href = result.url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(result.error || "Failed to download award");
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
              <Table className="table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Award</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No awards found
                      </TableCell>
                    </TableRow>
                  ) : paginated.map((award) => (
                    <TableRow key={award.id} className="hover:bg-muted/40 transition">
                      <TableCell>{award.student?.name}</TableCell>
                      <TableCell>{award.student?.email}</TableCell>
                      <TableCell>{award.student?.studentProfile?.studentId}</TableCell>
                      <TableCell className="max-w-[200px] whitespace-normal break-words">{award.student?.studentProfile?.program}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{award.name}</div>
                          <div className="text-sm text-muted-foreground">{award.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {award.category} • {award.year}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(award.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {award.s3Key && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAward(award.id, award.s3Key)}
                                disabled={viewLoading}
                              >
                                {viewLoading ? "Loading..." : "View"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadAward(award.s3Key)}
                                disabled={downloadLoading}
                              >
                                {downloadLoading ? "Downloading..." : "Download"}
                              </Button>
                            </>
                          )}
                          {award.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-700 border-green-300 hover:bg-green-50"
                                onClick={() => { setSelected(award); setAction("APPROVE"); }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-700 border-red-300 hover:bg-red-50"
                                onClick={() => { setSelected(award); setAction("REJECT"); }}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!action} onOpenChange={() => { setAction(null); setSelected(null); setFeedback(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{action === "APPROVE" ? "Approve Award" : "Reject Award"}</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <div className="mb-2 font-medium">Student: {selected?.student?.name}</div>
            <div className="mb-2 text-sm text-muted-foreground">Award: {selected?.name}</div>
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