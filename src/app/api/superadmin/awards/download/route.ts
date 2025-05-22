import { NextRequest } from "next/server";
import { withSuperAdmin } from "@/lib/api-middleware";
import { getSignedDownloadUrl } from "@/lib/s3";
import { apiResponse, handleApiError } from "@/lib/api-utils";

export const runtime = "nodejs";

async function handler(req: NextRequest) {
  try {
    if (req.method !== "GET") {
      return apiResponse({ error: "Method not allowed" }, 405);
    }

    const { searchParams } = new URL(req.url);
    const s3Key = searchParams.get("key");

    if (!s3Key) {
      return apiResponse({ error: "S3 key is required" }, 400);
    }

    // Get signed URL for the award file
    const signedUrl = await getSignedDownloadUrl(s3Key);

    return apiResponse({ url: signedUrl });
  } catch (error) {
    console.error("Error fetching award download URL:", error);
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler); 