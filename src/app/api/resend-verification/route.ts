import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";

const COOLDOWN_SECONDS = 60; // 1 minute
const MAX_RESENDS = 5;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: "No account found for this email." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ success: false, message: "This account is already verified." }, { status: 400 });
    }
    if (user.resendCount >= MAX_RESENDS) {
      return NextResponse.json({ success: false, message: `You have reached the maximum number of resend attempts. Please contact support if you need help.` }, { status: 429 });
    }
    if (user.lastResendAt) {
      const last = new Date(user.lastResendAt).getTime();
      const now = Date.now();
      if (now - last < COOLDOWN_SECONDS * 1000) {
        const wait = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - last)) / 1000);
        return NextResponse.json({ success: false, message: `Please wait ${wait} seconds before resending.` }, { status: 429 });
      }
    }
    // Generate new token and send email
    const verificationToken = await generateVerificationToken(user.id);
    await sendVerificationEmail(user.email, verificationToken.token);
    await db.user.update({
      where: { id: user.id },
      data: {
        resendCount: { increment: 1 },
        lastResendAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, message: "Verification email resent. Please check your inbox." });
  } catch (error) {
    console.error("[RESEND_VERIFICATION]", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
} 