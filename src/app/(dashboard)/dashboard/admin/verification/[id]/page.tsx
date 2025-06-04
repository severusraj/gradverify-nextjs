"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getVerificationSubmission, updateVerificationSubmission, getVerificationCertificateUrl } from "@/actions/admin-verification.actions";

interface Submission {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
  overallStatus: string;
  feedback: string | null;
  psaStatus: string;
  awardStatus: string;
  psaS3Key?: string | null;
  gradPhotoS3Key?: string | null;
  awardsS3Key?: string | null;
  createdAt: string;
}

export default function ReviewSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [psaStatus, setPsaStatus] = useState<any>("");
  const [awardStatus, setAwardStatus] = useState<any>("");

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getVerificationSubmission(params.id as string);
        if (!result.success || !result.data) throw new Error(result.message || "Failed to load submission");
        setSubmission({
          ...result.data,
          createdAt: typeof result.data.createdAt === "string" ? result.data.createdAt : result.data.createdAt?.toISOString?.() ?? "",
          psaS3Key: result.data.psaS3Key ?? null,
          gradPhotoS3Key: result.data.gradPhotoS3Key ?? null,
          ...(typeof (result.data as any).awardsS3Key === "string" ? { awardsS3Key: (result.data as any).awardsS3Key } : {}),
        });
        setFeedback(result.data.feedback || "");
        setPsaStatus(result.data.psaStatus);
        setAwardStatus(result.data.awardStatus);
      } catch (_err: unknown) {
        setError(_err instanceof Error ? _err.message : "Failed to load submission");
        console.error(_err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [params.id]);

  const handleSubmit = async () => {
    try {
      const result = await updateVerificationSubmission(submission!.id, {
        psaStatus,
        awardStatus,
        feedback,
      });
      if (!result.success) throw new Error(result.message || "Failed to update submission");
      toast.success("Submission updated successfully");
      router.push("/dashboard/admin/verification");
    } catch (_err: unknown) {
      toast.error("Failed to update submission");
      console.error(_err);
    }
  };

  const handlePreviewCertificate = async (certificateType: "psa" | "award" | "gradPhoto") => {
    try {
      const result = await getVerificationCertificateUrl(submission!.id, certificateType);
      if (!result.success || !result.data?.url) throw new Error(result.message || "Failed to get certificate URL");
      window.open(result.data.url, '_blank');
    } catch (_err: unknown) {
      toast.error("Failed to preview certificate");
      console.error(_err);
    }
  };

  const handleDownloadCertificate = async (certificateType: "psa" | "award" | "gradPhoto", filename: string) => {
    try {
      const result = await getVerificationCertificateUrl(submission!.id, certificateType);
      if (!result.success || !result.data?.url) throw new Error(result.message || "Failed to get download URL");
      const link = document.createElement("a");
      link.href = result.data.url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (_err: unknown) {
      toast.error("Failed to download certificate");
      console.error(_err);
    }
  };

  if (loading) return <div>Loading submission...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!submission) return <div>Submission not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Submission</h1>
        <p className="text-muted-foreground">
          Review and provide feedback for {submission.user?.name || 'this student'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{submission.user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{submission.user?.email || 'N/A'}</p>
            </div>
             <div>
              <p className="text-sm font-medium">Overall Status</p>
              <p className="text-sm text-muted-foreground">{submission.overallStatus}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Submitted</p>
              <p className="text-sm text-muted-foreground">
                {new Date(submission.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card>
          <CardHeader>
            <CardTitle>Certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">PSA Certificate</p>
              {submission.psaS3Key ? (
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewCertificate("psa")}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadCertificate("psa", "psa-certificate.pdf")}
                  >
                    Download
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not submitted</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Award Certificate</p>
              {submission.awardsS3Key ? (
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewCertificate("award")}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadCertificate("award", "award-certificate.pdf")}
                  >
                    Download
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not submitted</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Graduation Photo</p>
              {submission.gradPhotoS3Key ? (
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewCertificate("gradPhoto")}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadCertificate("gradPhoto", "graduation-photo.jpg")}
                  >
                    Download
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not submitted</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium mb-2">PSA Status</p>
                <Select value={psaStatus} onValueChange={setPsaStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Award Status</p>
                <Select value={awardStatus} onValueChange={setAwardStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Feedback</p>
              <Textarea
                placeholder="Enter your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/admin/verification")}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit Review</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 