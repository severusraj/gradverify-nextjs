import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { withAdmin } from "@/lib/api-middleware";

async function handler(req: NextRequest) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || undefined;

    const where: any = {
      ...(status && status !== "ALL" ? { overallStatus: status } : {}),
      OR: [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ],
    };

    const submissions = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: submissions });
  } catch (error) {
    console.error("Error fetching verification submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(handler);