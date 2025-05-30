"use server";

import { prisma } from "@/db/prisma";
import { getSessionUser } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3";

type SubmissionType = "PSA" | "GRADUATION_PHOTO" | "AWARD";

type SubmissionResult = {
  success: boolean;
  message: string;
};

export async function createSubmission(
  _prevState: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to submit.",
      };
    }

    if (user.role !== "STUDENT") {
      return {
        success: false,
        message: "Only students can submit documents.",
      };
    }

    const type = formData.get("type") as SubmissionType;
    const file = formData.get("file") as File;

    if (!type || !file) {
      return {
        success: false,
        message: "Type and file are required.",
      };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: "Only JPEG, PNG, and PDF files are allowed.",
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: "File size must be less than 5MB.",
      };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const key = await uploadToS3(buffer, file.name, file.type);

    // Create submission
    await prisma.studentProfile.create({
      data: {
        studentId: user.id,
        psaS3Key: key,
        program: "Default Program",
        department: "Default Department",
        dob: "2000-01-01",
        pob: "Default Place of Birth",
        userId: user.id,
        gradPhotoS3Key: "placeholder-grad-photo-key",
        user: { connect: { id: user.id } },
      },
    });

    return {
      success: true,
      message: "Submission successful. Your document is now pending review.",
    };
  } catch (error_) {
    const error = error_ as Error;
    console.error(error.message, error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
} 