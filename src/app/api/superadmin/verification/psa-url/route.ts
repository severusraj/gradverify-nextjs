import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { getSignedDownloadUrl } from "@/lib/s3";
import { apiResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

async function handler(req: NextRequest) {
  try {
    if (req.method !== "GET") {
      return apiResponse({ error: "Method not allowed" }, 405);
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return apiResponse({ error: "Student ID is required" }, 400);
    }

    // Get the student profile with PSA S3 key
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { psaS3Key: true }
    });

    if (!student) {
      return apiResponse({ error: "Student not found" }, 404);
    }

    if (!student.psaS3Key) {
      return apiResponse({ error: "PSA file not found" }, 404);
    }

    // Get signed URL for the PSA file
    const signedUrl = await getSignedDownloadUrl(student.psaS3Key);

    return apiResponse({ url: signedUrl });
  } catch (error) {
    console.error("Error fetching PSA URL:", error);
    return apiResponse({ error: "Failed to fetch PSA URL" }, 500);
  }
}

export const GET = withSuperAdmin(handler); 