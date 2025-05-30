"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { logoutUser } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Loader2Icon, LogOutIcon } from "lucide-react";

const [state, setState] = useState({ success: false, message: "" });
const [isPending, startTransition] = useTransition();

export function SuperadminLogoutButton() {
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success("Logout successful.");
      router.push("/login");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form
      action={() => {
        startTransition(() => {
          logoutUser().then(setState);
        });
      }}
    >
      <Button type="submit" disabled={isPending} variant="outline" className="gap-2">
        {isPending ? (
          <>
            <Loader2Icon className="size-4 animate-spin" /> Logging out...
          </>
        ) : (
          <>
            <LogOutIcon className="size-4" /> Logout
          </>
        )}
      </Button>
    </form>
  );
} 