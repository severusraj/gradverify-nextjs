import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation error",
        errors: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "An unexpected error occurred",
    },
    { status: 500 }
  );
} 