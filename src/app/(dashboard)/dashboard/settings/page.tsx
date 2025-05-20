"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Fetch user on mount
  useEffect(() => {
    fetch("/api/current-user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
        setName(data.user?.name || "");
      });
  }, []);

  // Role-aware dashboard path
  const dashboardPath =
    user?.role === "SUPER_ADMIN"
      ? "/dashboard/superadmin"
      : user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "FACULTY"
      ? "/dashboard/faculty"
      : user?.role === "STUDENT"
      ? "/dashboard/student"
      : "/dashboard";

  // Live validation
  useEffect(() => {
    const newErrors: any = {};
    if (!name.trim() || name.length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }
    if (password || newPassword || confirmPassword) {
      if (!password) newErrors.password = "Current password is required.";
      if (!newPassword || newPassword.length < 8) newErrors.newPassword = "New password must be at least 8 characters.";
      if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
  }, [name, password, newPassword, confirmPassword]);

  const isFormValid =
    name.trim().length >= 2 &&
    (!password && !newPassword && !confirmPassword ||
      password && newPassword.length >= 8 && newPassword === confirmPassword);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSaving(true);
    // TODO: Call your API to update name and/or password
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings updated!");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">User not found.</div>;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white py-12 px-2 md:px-0">
      <div className="w-full max-w-md mx-auto mb-6">
        <Link href={dashboardPath}>
          <Button variant="outline" className="w-full">&larr; Back to Dashboard</Button>
        </Link>
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your profile and password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave} autoComplete="off">
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-4">Profile</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  className={`w-full border rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${errors.name ? "border-red-400" : "border-gray-200"}`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby="name-error"
                />
                {errors.name && <div id="name-error" className="text-xs text-red-500 mt-1">{errors.name}</div>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-100 shadow-sm"
                  value={user.email}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Role</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-100 shadow-sm capitalize"
                  value={user.role.toLowerCase().replace("_", " ")}
                  readOnly
                  disabled
                />
              </div>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1" htmlFor="current-password">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  className={`w-full border rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${errors.password ? "border-red-400" : "border-gray-200"}`}
                  placeholder="Current password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                />
                {errors.password && <div id="password-error" className="text-xs text-red-500 mt-1">{errors.password}</div>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1" htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  className={`w-full border rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${errors.newPassword ? "border-red-400" : "border-gray-200"}`}
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  aria-describedby="new-password-error"
                />
                {errors.newPassword && <div id="new-password-error" className="text-xs text-red-500 mt-1">{errors.newPassword}</div>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className={`w-full border rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${errors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby="confirm-password-error"
                />
                {errors.confirmPassword && <div id="confirm-password-error" className="text-xs text-red-500 mt-1">{errors.confirmPassword}</div>}
              </div>
            </section>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={saving || !isFormValid}>
              {saving ? <span className="animate-spin mr-2">⏳</span> : null}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 