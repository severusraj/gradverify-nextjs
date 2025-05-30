"use server";

import { prisma } from "@/db/prisma";
import { z } from "zod";
import { Resend } from "resend";

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
    const emailPromises = invitation.recipients.map(recipient =>
      resend.emails.send({
        from: "Graduation Ceremony <noreply@yourdomain.com>",
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
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "INVITATION_SENT",
        userId: "system", // Optionally pass userId
        targetId: invitation.id,
        details: {
          invitationId: invitation.id,
          recipientCount: recipients.length,
          eventDate,
          eventLocation,
        },
      },
    });
    return { success: true, invitation };
  } catch (error) {
    console.error("Create invitation error:", error);
    return { success: false, message: "Failed to create invitation" };
  }
} 