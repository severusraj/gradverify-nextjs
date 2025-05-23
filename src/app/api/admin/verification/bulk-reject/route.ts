import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { withAdmin } from "@/lib/api-middleware";

async function handler(req: NextRequest) {
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
        psaStatus: "REJECTED",
        awardStatus: "REJECTED",
        overallStatus: "REJECTED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk reject error:", error);
    return NextResponse.json(
      { error: "Failed to reject submissions" },
      { status: 500 }
    );
  }
}

export const POST = withAdmin(handler); 