"use server";

import { prisma } from "@/db/prisma";
import { getSignedDownloadUrl } from "@/lib/utils/s3";

export async function getFacultyVerificationFileUrl(studentId: string, type: "psa" | "gradPhoto") {
  if (!studentId || !type) {
    return { success: false, message: "Missing studentId or type" };
  }

  const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
  if (!student) return { success: false, message: "Student not found" };

  let s3Key: string | null = null;
  if (type === "psa") s3Key = student.psaS3Key;
  else if (type === "gradPhoto") s3Key = student.gradPhotoS3Key;
  else return { success: false, message: "Invalid type" };

  if (!s3Key) return { success: false, message: "File not found" };

  const url = await getSignedDownloadUrl(s3Key);
  return { success: true, url };
} 