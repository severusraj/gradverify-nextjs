"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSubmission } from "@/actions/submission.actions";

export function SubmissionForm() {
  const [state, setState] = useState({ success: false, message: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      // Reset form
      const form = document.querySelector("form") as HTMLFormElement;
      form?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          createSubmission({ success: false, message: "" }, formData).then(setState);
        });
      }}
      className="block p-6 w-full max-w-md rounded-md border bg-background shadow-lg"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-lg font-bold leading-snug text-center">
            Submit Document
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            Upload your document for verification.
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="type">
              Document Type <span className="text-red-500">*</span>
            </Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PSA">PSA Birth Certificate</SelectItem>
                <SelectItem value="GRADUATION_PHOTO">Graduation Photo</SelectItem>
                <SelectItem value="AWARD">Award Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="file">
              File <span className="text-red-500">*</span>
            </Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              required
              className="transition-all h-10"
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPEG, PNG, PDF (max 5MB)
            </p>
          </div>
          <Button type="submit" className="w-full h-10" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>Submit Document</>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
} 