import { prisma } from "@/db/prisma";

export type AuditAction = 
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "STUDENT_STATUS_UPDATED"
  | "FILE_UPLOADED"
  | "FILE_DELETED";

type JsonValue = string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

export type AuditLogData = {
  action: AuditAction;
  userId: string;
  targetId?: string;
  details: JsonValue;
  ip?: string;
  userAgent?: string;
};

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId,
        targetId: data.targetId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: data.details as any,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogs(
  filters: {
    userId?: string;
    targetId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  },
  page = 1,
  limit = 10
) {
  const where: Record<string, unknown> = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.targetId) where.targetId = filters.targetId;
  if (filters.action) where.action = filters.action;
  if (filters.startDate && filters.endDate) {
    where.createdAt = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
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
    }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
} 