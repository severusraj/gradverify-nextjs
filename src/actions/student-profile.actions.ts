"use server";

import { prisma } from "@/db/prisma";
import { uploadToS3 } from "@/lib/utils/s3";
import { getSessionUser, type AuthPayload } from "@/lib/auth/auth";
import { z } from "zod";

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
      
      // Create Award record
      await prisma.award.create({
        data: {
          name: awards.name,
          description: "Academic Award Certificate",
          category: "Academic",
          year: new Date().getFullYear().toString(),
          studentId: user.id,
          s3Key: awardsKey,
          status: "PENDING"
        }
      });
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
        psaStatus: "PENDING",
        overallStatus: "PENDING",
        awardStatus: awards ? "PENDING" : "NOT_SUBMITTED"
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
        psaStatus: "PENDING",
        overallStatus: "PENDING",
        awardStatus: awards ? "PENDING" : "NOT_SUBMITTED"
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

// --- Validation Schemas ---
const awardSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(2).max(50),
  year: z.string().regex(/^[0-9]{4}$/),
  studentId: z.string(),
});

const bulkUpdateSchema = z.object({
  studentIds: z.array(z.string()),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

// --- Server Actions ---

export async function createAward({ name, description, category, year, studentId }: {
  name: string; description: string; category: string; year: string; studentId: string;
}) {
  try {
    const validation = awardSchema.safeParse({ name, description, category, year, studentId });
    if (!validation.success) return { success: false, message: "Invalid request data", details: validation.error.format() };

    const student = await prisma.user.findUnique({ where: { id: studentId }, include: { studentProfile: true } });
    if (!student || !student.studentProfile) return { success: false, message: "Student not found" };

    const award = await prisma.award.create({
      data: { name, description, category, year, studentId },
      include: { student: { select: { name: true, email: true, studentProfile: { select: { department: true, program: true } } } } }
    });

    // Optionally chain: update student profile status after award creation
    // await updateStudentProfileById({ id: student.studentProfile.id, awardStatus: 'APPROVED' });

    return { success: true, award };
  } catch (error) {
    console.error("Create award error:", error);
    return { success: false, message: "Failed to create award" };
  }
}

export async function updateStudentProfileById({ id, psaStatus, awardStatus, overallStatus, rejectionReason }: {
  id: string; psaStatus?: "PENDING" | "APPROVED" | "REJECTED"; awardStatus?: "PENDING" | "APPROVED" | "REJECTED"; overallStatus?: "PENDING" | "APPROVED" | "REJECTED"; rejectionReason?: string;
}) {
  try {
    if (!id) return { success: false, message: "Student ID is required" };
    const updatedStudent = await prisma.studentProfile.update({
      where: { id },
      data: { ...(psaStatus && { psaStatus }), ...(awardStatus && { awardStatus }), ...(overallStatus && { overallStatus }), ...(rejectionReason && { rejectionReason }) },
      include: { user: { select: { name: true, email: true } } }
    });
    return { success: true, student: updatedStudent };
  } catch (error) {
    console.error("Update student profile error:", error);
    return { success: false, message: "Failed to update student profile" };
  }
}

export async function bulkUpdateStudentProfiles({ studentIds, status, rejectionReason }: {
  studentIds: string[]; status: "PENDING" | "APPROVED" | "REJECTED"; rejectionReason?: string;
}) {
  try {
    const validation = bulkUpdateSchema.safeParse({ studentIds, status, rejectionReason });
    if (!validation.success) return { success: false, message: "Invalid request data" };

    const updatedStudents = await prisma.studentProfile.updateMany({
      where: { id: { in: studentIds } },
      data: { overallStatus: status, ...(rejectionReason && { rejectionReason }) }
    });

    return { success: true, message: `Updated ${updatedStudents.count} student profiles`, count: updatedStudents.count };
  } catch (error) {
    console.error("Bulk update error:", error);
    return { success: false, message: "Failed to update student profiles" };
  }
} 