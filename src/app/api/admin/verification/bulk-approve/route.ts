import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }

    await prisma.studentProfile.updateMany({
      where: { id: { in: ids } },
      data: {
        psaStatus: "APPROVED",
        awardStatus: "APPROVED",
        overallStatus: "APPROVED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Bulk approve error:", error);
    return NextResponse.json(
      { error: "Failed to approve submissions" },
      { status: 500 }
    );
  }
} 