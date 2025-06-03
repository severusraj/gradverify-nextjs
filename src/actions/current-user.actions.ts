"use server";

import { getCurrentUser } from "@/lib/utils/current-user";

export async function getCurrentUserServer() {
  try {
    const user = await getCurrentUser();
    return { user };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return { user: null };
  }
} 