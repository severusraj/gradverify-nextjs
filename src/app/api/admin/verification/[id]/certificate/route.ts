"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getSignedDownloadUrl } from "@/lib/s3";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  // Role check
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submissionId = context.params.id;
  if (!submissionId) {
    return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const certificateType = searchParams.get("type");

  if (!certificateType) {
    return NextResponse.json(
      { error: "Missing certificate type" },
      { status: 400 }
    );
  }

  if (!['psa', 'award', 'gradPhoto'].includes(certificateType)) {
    return NextResponse.json(
      { error: "Invalid certificate type" },
      { status: 400 }
    );
  }

  try {
    const submission = await prisma.studentProfile.findUnique({
      where: { id: submissionId },
      select: {
        psaS3Key: true,
        awardsS3Key: true,
        gradPhotoS3Key: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    let s3Key: string | null = null;
    if (certificateType === 'psa') {
      s3Key = submission.psaS3Key;
    } else if (certificateType === 'award') {
      s3Key = submission.awardsS3Key;
    } else if (certificateType === 'gradPhoto') {
      s3Key = submission.gradPhotoS3Key;
    }

    if (!s3Key) {
      return NextResponse.json({ error: `${certificateType} certificate not submitted` }, { status: 404 });
    }

    const signedUrl = await getSignedDownloadUrl(s3Key);
    return NextResponse.json({ url: signedUrl });
  } catch (error: unknown) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
} 