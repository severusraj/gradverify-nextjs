import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { withAdmin } from "@/lib/api-middleware";
import { getSignedDownloadUrl } from "@/lib/s3";

async function handler(req: NextRequest, context: { params: Record<string, string> }) {
  const submissionId = context.params.id;
  const { searchParams } = new URL(req.url);
  const certificateType = searchParams.get("type");
  const download = searchParams.get("download"); // This param is not directly used in the backend for link generation, but kept for potential future use or clarity

  if (req.method === "GET") {
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

      let s3Key: string | null | undefined;
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

      // For download, you might want to set Content-Disposition header,
      // but getSignedUrl with default options usually handles this for browsers
      // when the download=true query param is present (handled by the client side link logic)

      return NextResponse.json({ url: signedUrl });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return NextResponse.json(
        { error: "Failed to generate signed URL" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = withAdmin(handler); 