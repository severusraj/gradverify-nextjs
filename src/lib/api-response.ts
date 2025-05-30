import { NextResponse } from "next/server";

type ApiResponseOptions = {
  data?: unknown;
  message?: string;
  status?: number;
};

export function apiResponse({
  data,
  message = "Success",
  status = 200,
}: ApiResponseOptions) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
} 