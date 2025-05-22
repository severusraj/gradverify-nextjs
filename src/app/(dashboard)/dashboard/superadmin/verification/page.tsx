"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Use only the static departments array for the filter dropdown
const departmentOptions = [
  { name: "College of Allied Health Studies (CAHS)", programs: ["BS in Nursing", "BS in Midwifery"] },
  { name: "College of Business and Accountancy (CBA)", programs: [
    "BS in Accountancy",
    "BS in Business Administration Major in Financial Management",
    "BS in Business Administration Major in Human Resource Management",
    "BS in Business Administration Major in Marketing Management",
    "BS in Customs Administration",
  ] },
  { name: "College of Computer Studies (CCS)", programs: [
    "BS in Computer Science",
    "BS in Entertainment and Multimedia Computing",
    "BS in Information Technology",
  ] },
  { name: "College of Education, Arts, and Sciences (CEAS)", programs: [
    "BA in Communication",
    "BS in Early Childhood Education",
    "BS in Culture and Arts Education",
    "BS in Physical Education",
    "BS in Elementary Education (General Education)",
    "BS in Secondary Education major in English",
    "BS in Secondary Education major in Filipino",
    "BS in Secondary Education major in Mathematics",
    "BS in Secondary Education major in Social Studies",
    "BS in Secondary Education major in Sciences",
  ] },
  { name: "College of Hospitality and Tourism Management (CHTM)", programs: [
    "BS in Hospitality Management",
    "BS in Tourism Management",
  ] },
];

export default function VerificationManagementPage() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRequest, setViewRequest] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, current: 1, limit: 10 });
  const [psaUrl, setPsaUrl] = useState<string | null>(null);
  const [psaLoading, setPsaLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionStudent, setActionStudent] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [actionDocumentType, setActionDocumentType] = useState<"PSA" | "AWARD" | null>(null);

  // Fetch unique departments on mount
  useEffect(() => {
    fetch("/api/superadmin/verification?department=all&status=all")
      .then(res => res.json())
      .then(data => {
        const uniqueDepartments = Array.from(new Set((data.submissions || []).map((s: any) => String(s.department)).filter(Boolean))) as string[];
        setDepartments(uniqueDepartments);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = `/api/superadmin/verification?department=${selectedDepartment}&status=${statusFilter}&page=${page}&limit=${pageSize}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const students = data.data?.students || data.students || [];
        setRequests(students);
        setPagination(data.data?.pagination || data.pagination || { total: 0, pages: 1, current: 1, limit: 10 });
        // Set stats from API response
        const stats = data.data?.stats || data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
        setStats(stats);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load verification requests");
        setLoading(false);
      });
  }, [selectedDepartment, statusFilter, page, pageSize]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentId?.includes(searchQuery);
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "NOT_SUBMITTED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // PSA viewing
  const handleViewPSA = async (studentId: string) => {
    setPsaLoading(true);
    setPsaUrl(null);
    try {
      const res = await fetch(`/api/superadmin/verification/psa-url?studentId=${studentId}`);
      const data = await res.json();
      if (res.ok && data.data?.url) {
        setPsaUrl(data.data.url);
        setIsViewOpen(true);
      } else {
        toast.error(data.error || "Failed to fetch PSA file");
      }
    } catch {
      toast.error("Failed to fetch PSA file");
    } finally {
      setPsaLoading(false);
    }
  };

  // Approve/Reject
  const handleAction = async (student: any, type: "APPROVED" | "REJECTED", documentType: "PSA" | "AWARD") => {
    setActionStudent(student);
    setActionType(type);
    setActionDocumentType(documentType);
    setFeedback("");
  };

  const handleSubmitAction = async () => {
    if (!actionStudent || !actionType || !actionDocumentType) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/superadmin/verification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: actionStudent.id,
          status: actionType,
          feedback: actionType === "REJECTED" ? feedback : undefined,
          type: actionDocumentType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${actionDocumentType} ${actionType === "APPROVED" ? "approved" : "rejected"}`);
        setActionStudent(null);
        setActionType(null);
        setActionDocumentType(null);
        setFeedback("");
        // Refresh data
        const url = `/api/superadmin/verification?department=${selectedDepartment}&status=${statusFilter}&page=${page}&limit=${pageSize}`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
            const students = data.data?.students || data.students || [];
            setRequests(students);
            setPagination(data.data?.pagination || data.pagination || { total: 0, pages: 1, current: 1, limit: 10 });
          });
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading verification requests...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  // Debug log for stats
  console.log("Stats from API:", stats);

  // Pagination controls
  const pages = Array.from({ length: pagination.pages }, (_, i) => i + 1);

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Verification Management</h1>
        <p className="text-muted-foreground">
          Review and process student verification requests
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departmentOptions.map((dept) => (
              <SelectItem key={dept.name} value={dept.name}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PSA Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Award Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Overall</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-4 py-2">
                      <div className="font-medium">{request.user?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{request.studentId}</div>
                    </td>
                    <td className="px-4 py-2">{request.department}</td>
                    <td className="px-4 py-2">{request.program}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.psaStatus)}`}>
                        {request.psaStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.awardStatus)}`}>
                        {request.awardStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.overallStatus)}`}>
                        {request.overallStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">{new Date(request.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewPSA(request.id)}>
                            View PSA
                          </DropdownMenuItem>
                          {request.psaStatus === "PENDING" && (
                            <>
                              <DropdownMenuItem onClick={() => handleAction(request, "APPROVED", "PSA")}>
                                Approve PSA
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(request, "REJECTED", "PSA")}>
                                Reject PSA
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.awardStatus === "PENDING" && (
                            <>
                              <DropdownMenuItem onClick={() => handleAction(request, "APPROVED", "AWARD")}>
                                Approve Award
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(request, "REJECTED", "AWARD")}>
                                Reject Award
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="text-center text-muted-foreground py-8">
                      No verification requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              {pages.map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
            <div>
              <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(size => (
                    <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for viewing request details */}
      {isViewOpen && viewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative overflow-hidden">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl z-10"
              onClick={() => setIsViewOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Verification Request Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-4">
              {/* Left Column: Details */}
              <div className="space-y-2">
                <div><b>Name:</b> {viewRequest.user?.name}</div>
                <div><b>Email:</b> {viewRequest.user?.email}</div>
                <div><b>Student ID:</b> {viewRequest.studentId}</div>
                <div><b>Department:</b> {viewRequest.department}</div>
                <div><b>Program:</b> {viewRequest.program}</div>
                <div className="space-y-1">
                  <div><b>PSA Status:</b> <span className={getStatusColor(viewRequest.psaStatus)}>{viewRequest.psaStatus}</span></div>
                  <div><b>Award Status:</b> <span className={getStatusColor(viewRequest.awardStatus)}>{viewRequest.awardStatus}</span></div>
                  <div><b>Overall Status:</b> <span className={getStatusColor(viewRequest.overallStatus)}>{viewRequest.overallStatus}</span></div>
                </div>
                <div><b>Date of Birth:</b> {viewRequest.dob}</div>
                <div><b>Place of Birth:</b> {viewRequest.pob}</div>
                <div><b>Submitted At:</b> {new Date(viewRequest.createdAt).toLocaleString()}</div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPSA(viewRequest.id)}
                    disabled={psaLoading}
                  >
                    {psaLoading ? "Loading..." : "View PSA"}
                  </Button>
                  {viewRequest.psaStatus === "PENDING" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAction(viewRequest, "APPROVED", "PSA")}
                        disabled={actionLoading}
                      >
                        Approve PSA
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction(viewRequest, "REJECTED", "PSA")}
                        disabled={actionLoading}
                      >
                        Reject PSA
                      </Button>
                    </>
                  )}
                  {viewRequest.awardStatus === "PENDING" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAction(viewRequest, "APPROVED", "AWARD")}
                        disabled={actionLoading}
                      >
                        Approve Award
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction(viewRequest, "REJECTED", "AWARD")}
                        disabled={actionLoading}
                      >
                        Reject Award
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: PSA Content */}
              {psaUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">PSA Content</h3>
                  <div className="border rounded-md overflow-hidden">
                    <img src={psaUrl} alt="PSA Document" className="max-w-full h-auto" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Approve/Reject action with feedback */}
      {actionStudent && actionType && actionDocumentType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => { setActionStudent(null); setActionType(null); setActionDocumentType(null); setFeedback(""); }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">
              {actionType === "APPROVED" ? "Approve" : "Reject"} {actionDocumentType}
            </h2>
            <div className="mb-4">
              <div><b>Name:</b> {actionStudent.user?.name}</div>
              <div><b>Student ID:</b> {actionStudent.studentId}</div>
              <div><b>Department:</b> {actionStudent.department}</div>
              <div><b>Program:</b> {actionStudent.program}</div>
            </div>
            {actionType === "REJECTED" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rejection Feedback</label>
                <Input
                  placeholder="Enter feedback for rejection..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  disabled={actionLoading}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant={actionType === "APPROVED" ? "default" : "destructive"}
                size="sm"
                onClick={handleSubmitAction}
                disabled={actionLoading || (actionType === "REJECTED" && !feedback)}
              >
                {actionLoading ? "Processing..." : (actionType === "APPROVED" ? "Approve" : "Reject")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setActionStudent(null); setActionType(null); setActionDocumentType(null); setFeedback(""); }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 