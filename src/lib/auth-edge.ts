import { cookies } from "next/headers";
import { SESSION_TOKEN } from "./constants";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SECRET_KEY);

export type AuthPayload = {
  id: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "SUPER_ADMIN" | "FACULTY";
  name?: string;
};

export async function getSessionUserWithStatusEdge<T = any>(): Promise<{ user: T | null, invalidToken: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_TOKEN)?.value;
    if (!token) return { user: null, invalidToken: false };

    try {
      const { payload } = await jwtVerify(token, SECRET);
      return { user: payload as T, invalidToken: false };
    } catch {
      return { user: null, invalidToken: true };
    }
  } catch {
    return { user: null, invalidToken: false };
  }
} 