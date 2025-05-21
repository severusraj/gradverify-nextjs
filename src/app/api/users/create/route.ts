import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import bcrypt from "bcrypt";
import { getCurrentUser } from "@/lib/current-user";
import { Resend } from "resend";
import { LoginInfoMessage } from "@/components/mail/login-info-message";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Check if the current user is a super admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== "ADMIN" && role !== "FACULTY") {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: new Date() // Auto verify admin/faculty accounts
      }
    });

    // Send welcome email
    await resend.emails.send({
      from: "GradVerify <onboarding@resend.dev>",
      to: user.email,
      subject: `Welcome to GradVerify! ${user.name}`,
      react: LoginInfoMessage({
        email: user.email,
        originalPassword: password,
        hashedPassword: user.password,
      }),
    });

    // Return success without sensitive data
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 