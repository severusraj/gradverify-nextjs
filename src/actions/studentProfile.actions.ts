"use server";

import { prisma } from "@/db/prisma";
import { uploadToS3 } from "@/lib/s3";
import { getSessionUser, type AuthPayload } from "@/lib/auth";

export type StudentProfilePayload = {
  studentId: string;
  program: string;
  department: string;
  dob: string;
  pob: string;
  psaFile: File | null;
  gradPhoto: File | null;
  awards: File | null;
};

export type StudentProfileResult = {
  success: boolean;
  message: string;
};

export async function submitStudentProfile(
  _prevState: StudentProfileResult,
  formData: FormData
): Promise<StudentProfileResult> {
  try {
    const user = await getSessionUser<AuthPayload>();
    if (!user) {
      return { success: false, message: "You must be logged in." };
    }

    // Validate required fields
    const studentId = formData.get("studentId") as string;
    const program = formData.get("program") as string;
    const department = formData.get("department") as string;
    const dob = formData.get("dob") as string;
    const pob = formData.get("pob") as string;
    const psaFile = formData.get("psaFile") as File | null;
    const gradPhoto = formData.get("gradPhoto") as File | null;
    const awards = formData.get("awards") as File | null;

    if (!studentId || !program || !department || !dob || !pob || !psaFile || !gradPhoto) {
      return { success: false, message: "All fields except awards are required." };
    }

    // Upload files to S3
    const psaBuffer = Buffer.from(await psaFile.arrayBuffer());
    const psaKey = await uploadToS3(psaBuffer, psaFile.name, psaFile.type);

    const gradPhotoBuffer = Buffer.from(await gradPhoto.arrayBuffer());
    const gradPhotoKey = await uploadToS3(gradPhotoBuffer, gradPhoto.name, gradPhoto.type);

    let awardsKey: string | null = null;
    if (awards) {
      const awardsBuffer = Buffer.from(await awards.arrayBuffer());
      awardsKey = await uploadToS3(awardsBuffer, awards.name, awards.type);
    }

    // Store profile and file info in the database
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        studentId,
        program,
        department,
        dob,
        pob,
        psaS3Key: psaKey,
        gradPhotoS3Key: gradPhotoKey,
        awardsS3Key: awardsKey,
        psaStatus: "PENDING",
        overallStatus: "PENDING",
      },
      create: {
        userId: user.id,
        studentId,
        program,
        department,
        dob,
        pob,
        psaS3Key: psaKey,
        gradPhotoS3Key: gradPhotoKey,
        awardsS3Key: awardsKey,
        psaStatus: "PENDING",
        overallStatus: "PENDING",
      },
    });

    return { success: true, message: "Profile and documents submitted successfully!" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message, error);
    } else {
      console.error(error);
    }
    return { success: false, message: "Submission failed. Please try again." };
  }
} 