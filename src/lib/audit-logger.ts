import { prisma } from "@/db/prisma";

export type AuditAction = 
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "STUDENT_STATUS_UPDATED"
  | "FILE_UPLOADED"
  | "FILE_DELETED";

export type AuditLogData = {
  action: AuditAction;
  userId: string;
  targetId?: string;
  details: Record<string, any>;
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
        details: data.details,
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
  const where = {
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.targetId && { targetId: filters.targetId }),
    ...(filters.action && { action: filters.action }),
    ...(filters.startDate && filters.endDate && {
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    }),
  };

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