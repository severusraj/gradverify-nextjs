"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateAdminOrFacultyUser } from "@/actions/superadmin-users.actions";
import type { User } from "@/lib/utils/current-user";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUpdated?: (updated: User) => void;
}

export function EditUserDialog({ open, onOpenChange, user, onUpdated }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "ADMIN",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; password?: string }>({});

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, role: user.role, password: "" });
      setFieldErrors({});
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    // Basic validation
    const errors: { name?: string; password?: string } = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }
    if (formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateAdminOrFacultyUser({
        id: user.id,
        name: formData.name,
        role: formData.role as "ADMIN" | "FACULTY",
        password: formData.password || undefined,
      });
      if (result.success) {
        toast.success("User updated successfully");
        onOpenChange(false);
        if (onUpdated && result.user) onUpdated(result.user as User);
      } else {
        toast.error(result.message || "Failed to update user");
      }
    } catch (err) {
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update the user\'s information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
            {fieldErrors.name && <div className="text-red-600 text-sm">{fieldErrors.name}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="FACULTY">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password (optional)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            {fieldErrors.password && <div className="text-red-600 text-sm">{fieldErrors.password}</div>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 