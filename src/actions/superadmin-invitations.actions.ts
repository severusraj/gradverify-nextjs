"use server";

import { prisma } from "@/db/prisma";
import { z } from "zod";
import { Resend } from "resend";
import { getSessionUser, type AuthPayload } from "@/lib/auth/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

const invitationSchema = z.object({
  recipients: z.array(z.string()),
  template: z.string(),
  subject: z.string(),
  eventDate: z.string(),
  eventLocation: z.string(),
});

export async function createInvitation({ recipients, template, subject, eventDate, eventLocation }: {
  recipients: string[];
  template: string;
  subject: string;
  eventDate: string;
  eventLocation: string;
}) {
  try {
    const validation = invitationSchema.safeParse({ recipients, template, subject, eventDate, eventLocation });
    if (!validation.success) {
      return { success: false, message: "Invalid request data", details: validation.error.format() };
    }
    // Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        template,
        subject,
        eventDate,
        eventLocation,
        status: "PENDING",
        recipients: {
          connect: recipients.map(id => ({ id })),
        },
      },
      include: {
        recipients: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    // Send emails
    const emailPromises = invitation.recipients.map((recipient: { name: string; email: string; role: string }) =>
      resend.emails.send({
        from: "GradVerify <noreply@gc-gradverify.space>",
        to: recipient.email,
        subject,
        html: template
          .replace("{{name}}", recipient.name)
          .replace("{{eventDate}}", eventDate)
          .replace("{{eventLocation}}", eventLocation),
      })
    );
    await Promise.all(emailPromises);
    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "SENT" },
    });
    // Create audit log with real user ID
    const user = await getSessionUser<AuthPayload>();
    if (user) {
      await prisma.auditLog.create({
        data: {
          action: "INVITATION_SENT",
          userId: user.id,
          targetId: invitation.id,
          details: {
            invitationId: invitation.id,
            recipientCount: recipients.length,
            eventDate,
            eventLocation,
          },
        },
      });
    }
    return { success: true, invitation };
  } catch (error) {
    console.error("Create invitation error:", error);
    return { success: false, message: "Failed to create invitation" };
  }
}

export async function getInvitationRecipients({
  page = 1,
  limit = 20,
  search = "",
  role = "",
  department = "",
  award = ""
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  department?: string;
  award?: string;
}) {
  try {
    // Build where clause
    const where: Record<string, unknown> = {};
    if (role && role !== "All") {
      where.role = role === "Graduate" ? "STUDENT" : role.toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if ((department && department !== "All") || (award && award !== "All")) {
      where.studentProfile = { is: {} };
      const studentProfile = (where.studentProfile as { is: Record<string, unknown> }).is;
      if (department && department !== "All") {
        studentProfile.department = { contains: department, mode: "insensitive" };
      }
      if (award && award !== "All") {
        // Find students with at least one award
        const studentIdsWithAwards = await prisma.award.findMany({
          select: { studentId: true },
          distinct: ["studentId"]
        });
        const ids = studentIdsWithAwards.map((a: { studentId: string }) => a.studentId);
        studentProfile.userId = { in: ids };
      }
    }
    // Count total
    const total = await prisma.user.count({ where });
    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentProfile: {
          select: {
            department: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    // Map to frontend format
    const recipients = users.map((u: { id: string; name: string; email: string; role: string; studentProfile?: { department?: string } | null }) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: "Graduating Student",
      department: u.studentProfile?.department || "",
    }));
    return {
      success: true,
      recipients,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching invitation recipients:", error);
    return { success: false, error: "Failed to fetch invitation recipients" };
  }
} 