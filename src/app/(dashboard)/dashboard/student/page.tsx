import { SubmissionForm } from "@/components/forms/submission-form";
import { prisma } from "@/db/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSignedDownloadUrl } from "@/lib/s3";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import StudentMultiStepSubmissionForm from "@/components/forms/StudentMultiStepSubmissionForm";
import { Navbar } from "@/components/navbar";

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
    <div className="min-h-screen w-full flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 w-full flex flex-col items-center justify-center py-12 px-2 md:px-0">
        <div className="w-full max-w-3xl flex flex-col items-center justify-center gap-12">
          <div className="flex flex-col gap-8 w-full">
            <h1 className="text-4xl text-center font-bold tracking-tighter sm:text-5xl md:text-6xl mb-2">
              Document Submission
            </h1>
            <p className="text-muted-foreground text-xl text-center mb-4">
              Submit your documents for graduation verification below.
            </p>
          </div>
          {/* Multi-step Form */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-0 md:p-8 shadow-none">
              <StudentMultiStepSubmissionForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 