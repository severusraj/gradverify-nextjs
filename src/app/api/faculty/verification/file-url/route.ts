import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { getSignedDownloadUrl } from "@/lib/utils/s3";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  const type = req.nextUrl.searchParams.get("type"); // 'psa' or 'gradPhoto'

  if (!studentId || !type) {
    return new Response("Missing studentId or type", { status: 400 });
  }

  const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
  if (!student) return new Response("Student not found", { status: 404 });

  let s3Key: string | null = null;
  if (type === "psa") s3Key = student.psaS3Key;
  else if (type === "gradPhoto") s3Key = student.gradPhotoS3Key;
  else return new Response("Invalid type", { status: 400 });

  if (!s3Key) return new Response("File not found", { status: 404 });

  const url = await getSignedDownloadUrl(s3Key);
  return Response.json({ url });
} 