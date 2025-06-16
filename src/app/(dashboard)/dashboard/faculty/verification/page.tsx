"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Eye, Check, X, Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { facultyVerifyDocument } from "@/actions/faculty.actions";

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  program: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  psaFile?: string;
  gradPhoto?: string;
  createdAt?: string;
}

const departments = ["All", "CCS", "CBA", "CAHS", "CEAS", "CHTM"];
const statuses = ["All", "Pending", "Approved", "Rejected", "Not Submitted"];

export default function FacultyVerificationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [psaUrl, setPsaUrl] = useState<string | null>(null);
  const [psaLoading, setPsaLoading] = useState(false);
  const [gradPhotoUrl, setGradPhotoUrl] = useState<string | null>(null);
  const [gradPhotoLoading, setGradPhotoLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { getFacultyStudents } = await import("@/actions/faculty-students.actions");
      const data = await getFacultyStudents({
        page,
        pageSize,
        department: departmentFilter !== "All" ? departmentFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      });
      setStudents(Array.isArray(data.students) ? data.students : []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to load students");
        toast.error(err.message || "Failed to load students");
      } else {
        setError("Failed to load students");
        toast.error("Failed to load students");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleVerification = async (studentId: string, action: "approve" | "reject") => {
    try {
      setIsVerifying(true);
      const result = await facultyVerifyDocument({ studentId, action, feedback });
      if (!result.success) throw new Error(result.message || "Failed to process verification");
      toast.success(`Document ${action === "approve" ? "approved" : "rejected"} successfully`);
      setSelectedStudent(null);
      setFeedback("");
      fetchStudents(); // Refresh the list
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to process verification");
      } else {
        toast.error("Failed to process verification");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Fetch signed S3 URL for PSA
  const handleViewPSA = async (studentId: string) => {
    setPsaLoading(true);
    setPsaUrl(null);
    try {
      const { getFacultyVerificationFileUrl } = await import("@/actions/faculty-verification.actions");
      const data = await getFacultyVerificationFileUrl(studentId, "psa");
      if (!data.success) throw new Error(data.message || "Failed to fetch PSA file");
      setPsaUrl(data.url ?? null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to fetch PSA file");
      } else {
        toast.error("Failed to fetch PSA file");
      }
    } finally {
      setPsaLoading(false);
    }
  };

  // Fetch signed S3 URL for Graduation Photo
  const handleViewGradPhoto = async (studentId: string) => {
    setGradPhotoLoading(true);
    setGradPhotoUrl(null);
    try {
      const { getFacultyVerificationFileUrl } = await import("@/actions/faculty-verification.actions");
      const data = await getFacultyVerificationFileUrl(studentId, "gradPhoto");
      if (!data.success) throw new Error(data.message || "Failed to fetch Graduation Photo");
      setGradPhotoUrl(data.url ?? null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to fetch Graduation Photo");
      } else {
        toast.error("Failed to fetch Graduation Photo");
      }
    } finally {
      setGradPhotoLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Student Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No students found</TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>
                        <Badge variant={
                          student.status === "APPROVED" ? "default" :
                          student.status === "REJECTED" ? "destructive" :
                          "secondary"
                        }>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {student.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-green-400 border-green-500/30 hover:bg-green-500/20 hover:text-green-300"
                                onClick={() => handleVerification(student.id, "approve")}
                                disabled={isVerifying}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                                onClick={() => handleVerification(student.id, "reject")}
                                disabled={isVerifying}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0 || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedStudent} onOpenChange={() => {
        setSelectedStudent(null);
        setPsaUrl(null);
        setGradPhotoUrl(null);
        setPsaLoading(false);
        setGradPhotoLoading(false);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Student ID</p>
                  <p>{selectedStudent.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p>{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p>{selectedStudent.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Program</p>
                  <p>{selectedStudent.program}</p>
                </div>
                {selectedStudent.psaFile && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium">PSA Document</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPSA(selectedStudent.id)}
                      disabled={psaLoading}
                      className="mb-2"
                    >
                      {psaLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      View/Download PSA
                    </Button>
                    {psaUrl && (
                      <div className="mt-2">
                        <a
                          href={psaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline mr-4"
                          download
                        >
                          Download PSA
                        </a>
                        {/* Preview if image */}
                        <div className="mt-2">
                          <Image src={psaUrl} alt="PSA Document" width={256} height={256} className="max-h-64 rounded border" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedStudent.gradPhoto && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Graduation Photo</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewGradPhoto(selectedStudent.id)}
                      disabled={gradPhotoLoading}
                      className="mb-2"
                    >
                      {gradPhotoLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      View/Download Photo
                    </Button>
                    {gradPhotoUrl && (
                      <div className="mt-2">
                        <a
                          href={gradPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline mr-4"
                          download
                        >
                          Download Photo
                        </a>
                        {/* Preview if image */}
                        <div className="mt-2">
                          <Image src={gradPhotoUrl} alt="Graduation Photo" width={256} height={256} className="max-h-64 rounded border" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedStudent.status === "PENDING" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Feedback</p>
                  <Input
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter feedback (optional)"
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStudent(null);
                    setFeedback("");
                  }}
                >
                  Close
                </Button>
                {selectedStudent.status === "PENDING" && (
                  <>
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 border-green-500"
                      onClick={() => handleVerification(selectedStudent.id, "approve")}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 border-red-500"
                      onClick={() => handleVerification(selectedStudent.id, "reject")}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Reject"
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 