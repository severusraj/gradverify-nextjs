import { NextRequest } from "next/server";
import { prisma } from "@/db/prisma";
import { withSuperAdmin } from "@/lib/api-middleware";
import { apiResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = "nodejs";

// Validation schema for invitation creation
const invitationSchema = z.object({
  recipients: z.array(z.string()),
  template: z.string(),
  subject: z.string(),
  eventDate: z.string(),
  eventLocation: z.string(),
});

async function handler(req: NextRequest) {
  try {
    if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");

      // Build where clause
      const where: any = {};
      if (status && status !== "all") {
        where.status = status;
      }

      // Get total count for pagination
      const total = await prisma.invitation.count({ where });

      // Get paginated invitations
      const invitations = await prisma.invitation.findMany({
        where,
        include: {
          recipients: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return apiResponse({
        invitations,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
          limit,
        },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const validation = invitationSchema.safeParse(body);

      if (!validation.success) {
        return apiResponse({ 
          error: "Invalid request data", 
          details: validation.error.format() 
        }, 400);
      }

      const { recipients, template, subject, eventDate, eventLocation } = validation.data;

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
          userId: req.headers.get("x-user-id") || "system",
          targetId: invitation.id,
          details: {
            invitationId: invitation.id,
            recipientCount: recipients.length,
            eventDate,
            eventLocation,
          },
        },
      });

      return apiResponse({ invitation }, 201);
    }

    return apiResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withSuperAdmin(handler);
export const POST = withSuperAdmin(handler); 