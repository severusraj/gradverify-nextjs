"use server";

import { prisma } from "@/db/prisma";
import { isAfter } from "date-fns";
import { SEARCH_PARAMS_TOKEN } from "@/lib/utils/constants";

export async function verifyEmailToken(token: string) {
  if (!token) {
    return { success: false, message: "Token is required." };
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verification) {
    return { success: false, message: "Invalid or expired token." };
  }

  if (isAfter(new Date(), verification.expires)) {
    return { success: false, message: "Token has expired." };
  }

  await prisma.user.update({
    where: { email: verification.email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return { success: true, message: "Email verified successfully.", redirectUrl: "/login" };
} 