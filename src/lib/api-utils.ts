import { NextResponse } from "next/server";

export type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  message?: string;
};

export function apiResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function apiError(
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);
  
  if (error instanceof Error) {
    return apiError(error.message);
  }
  
  return apiError("An unexpected error occurred");
}

// Validation helper
export function validateRequest<T>(
  data: unknown,
  validator: (data: unknown) => data is T
): { isValid: boolean; data?: T; error?: string } {
  try {
    if (validator(data)) {
      return { isValid: true, data };
    }
    return { isValid: false, error: "Invalid request data" };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : "Validation failed" 
    };
  }
} 