"use server";

import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/lib/utils/current-user";
import { getSignedDownloadUrl } from "@/lib/utils/s3";

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";

export async function adminBulkRejectVerifications({ ids }: { ids: string[] }) {
  try {
    if (!Array.isArray(ids)) {
      return { success: false, message: "Invalid ids" };
    }
    await prisma.studentProfile.updateMany({
      where: { id: { in: ids } },
      data: {
        psaStatus: "REJECTED",
        awardStatus: "REJECTED",
        overallStatus: "REJECTED",
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Bulk reject error:", error);
    return { success: false, message: "Failed to reject submissions" };
  }
}

export async function adminBulkApproveVerifications({ ids }: { ids: string[] }) {
  try {
    if (!Array.isArray(ids)) {
      return { success: false, message: "Invalid ids" };
    }
    await prisma.studentProfile.updateMany({
      where: { id: { in: ids } },
      data: {
        psaStatus: "APPROVED",
        awardStatus: "APPROVED",
        overallStatus: "APPROVED",
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Bulk approve error:", error);
    return { success: false, message: "Failed to approve submissions" };
  }
}

export async function searchVerificationSubmissions({
  search = "",
  status,
}: {
  search?: string;
  status?: string;
}) {
  try {
    const where: Record<string, unknown> = {
      ...(status && status !== "ALL" ? { overallStatus: status } : {}),
      OR: [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ],
    };

    const submissions = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: submissions,
    };
  } catch (error) {
    console.error("Error searching verification submissions:", error);
    return {
      success: false,
      message: "Failed to search submissions",
    };
  }
}

export async function getVerificationSubmission(id: string) {
  try {
    // Role check
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return { success: false, message: "Forbidden" };
    }

    if (!id) {
      return { success: false, message: "Verification ID is required" };
    }

    const submission = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return { success: false, message: "Submission not found" };
    }

    return { success: true, data: submission };
  } catch (error) {
    console.error("Error fetching submission details:", error);
    return { success: false, message: "Failed to fetch submission details" };
  }
}

export async function updateVerificationSubmission(
  id: string,
  data: {
    psaStatus?: SubmissionStatus;
    awardStatus?: SubmissionStatus;
    feedback?: string;
  }
) {
  try {
    // Role check
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return { success: false, message: "Forbidden" };
    }

    if (!id) {
      return { success: false, message: "Verification ID is required" };
    }

    // Only include fields that are present
    const updateData: any = {};
    if (data.psaStatus) updateData.psaStatus = data.psaStatus;
    if (data.awardStatus) updateData.awardStatus = data.awardStatus;
    if (data.feedback) updateData.feedback = data.feedback;

    const updatedSubmission = await prisma.studentProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Determine new overall status
    let newOverallStatus = updatedSubmission.overallStatus; // Keep current if no change
    if (updatedSubmission.psaStatus === "APPROVED" && updatedSubmission.awardStatus === "APPROVED") {
      newOverallStatus = "APPROVED";
    } else if (updatedSubmission.psaStatus === "REJECTED" || updatedSubmission.awardStatus === "REJECTED") {
      newOverallStatus = "REJECTED";
    }

    // Update overall status if it changed
    if (newOverallStatus !== updatedSubmission.overallStatus) {
      await prisma.studentProfile.update({
        where: { id },
        data: { overallStatus: newOverallStatus },
      });
    }

    return { success: true, data: updatedSubmission };
  } catch (error) {
    console.error("Error updating submission:", error);
    return { success: false, message: "Failed to update submission" };
  }
}

export async function getVerificationCertificateUrl(id: string, type: "psa" | "award" | "gradPhoto") {
  try {
    // Role check
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return { success: false, message: "Forbidden" };
    }

    if (!id) {
      return { success: false, message: "Submission ID is required" };
    }

    if (!type || !["psa", "award", "gradPhoto"].includes(type)) {
      return { success: false, message: "Invalid certificate type" };
    }

    let s3Key: string | null = null;

    if (type === "award") {
      // Fetch the award for this student profile
      const award = await prisma.award.findFirst({
        where: { studentId: id },
        select: { s3Key: true },
      });
      s3Key = award?.s3Key || null;
    } else {
      // Fetch the student profile for PSA or gradPhoto
      const submission = await prisma.studentProfile.findUnique({
        where: { id },
        select: {
          psaS3Key: true,
          gradPhotoS3Key: true,
        },
      });
      if (!submission) {
        return { success: false, message: "Submission not found" };
      }
      if (type === "psa") {
        s3Key = submission.psaS3Key;
      } else if (type === "gradPhoto") {
        s3Key = submission.gradPhotoS3Key;
      }
    }

    if (!s3Key) {
      return { success: false, message: `${type} certificate not submitted` };
    }

    const signedUrl = await getSignedDownloadUrl(s3Key);
    return { success: true, data: { url: signedUrl } };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { success: false, message: "Failed to generate signed URL" };
  }
} 