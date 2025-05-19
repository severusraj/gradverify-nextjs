import { SubmissionForm } from "@/components/forms/submission-form";
import { prisma } from "@/db/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSignedDownloadUrl } from "@/lib/s3";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import StudentMultiStepSubmissionForm from "@/components/forms/StudentMultiStepSubmissionForm";

type SubmissionType = "PSA" | "GRADUATION_PHOTO" | "AWARD";
type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

type Submission = {
  id: string;
  studentId: string;
  type: SubmissionType;
  data: {
    fileName: string;
    fileType: string;
    fileSize: number;
    s3Key: string;
  };
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
};

type SubmissionWithFeedback = Submission & {
  feedback: {
    message: string;
  } | null;
};

export default async function StudentDashboard() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const submissions = await prisma.submission.findMany({
    where: {
      studentId: user.id,
    },
    include: {
      feedback: {
        select: {
          message: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const submissionsWithUrls = await Promise.all(
    submissions.map(async (submission) => {
      const data = submission.data as {
        fileName: string;
        fileType: string;
        fileSize: number;
        s3Key: string;
      };
      return {
        ...submission,
        data,
        downloadUrl: await getSignedDownloadUrl(data.s3Key),
      };
    })
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white py-12 px-2 md:px-0">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center gap-12">
        <div className="flex flex-col gap-8 w-full">
          <h1 className="text-4xl text-center font-bold tracking-tighter sm:text-5xl md:text-6xl mb-2">
            Document Submission
          </h1>
          <p className="text-muted-foreground text-xl text-center mb-4">
            Submit your documents for graduation verification below.
          </p>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-12 items-start justify-center">
          {/* Multi-step Form */}
          <div className="flex-1 w-full max-w-lg mx-auto">
            <StudentMultiStepSubmissionForm />
          </div>
          {/* Submissions List */}
          <div className="flex-1 w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Your Submissions</h2>
            <div className="space-y-6">
              {submissionsWithUrls.length === 0 ? (
                <p className="text-muted-foreground text-center">No submissions yet.</p>
              ) : (
                submissionsWithUrls.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col gap-2 shadow-none hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {submission.type.replace("_", " ")}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          File: <span className="font-medium">{submission.data.fileName}</span>
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${{
                          APPROVED: "bg-green-50 text-green-700 border-green-200",
                          REJECTED: "bg-red-50 text-red-700 border-red-200",
                          PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
                        }[submission.status]}`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <a
                          href={submission.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <DownloadIcon className="size-4" />
                          Download
                        </a>
                      </Button>
                      {submission.feedback && (
                        <div className="ml-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                          <span className="font-medium">Feedback:</span> {submission.feedback.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 