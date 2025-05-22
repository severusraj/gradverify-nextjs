"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SuperAdminSettingsPage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    fetch("/api/current-user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile({ name: data.user.name, email: data.user.email });
          setUserId(data.user.id);
        }
      });
  }, []);

  // Profile validation
  useEffect(() => {
    const errors: { name?: string; email?: string } = {};
    if (!profile.name.trim() || profile.name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }
    if (!profile.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) {
      errors.email = "Invalid email address.";
    }
    setProfileErrors(errors);
  }, [profile]);

  // Password validation
  useEffect(() => {
    const errors: { current?: string; new?: string; confirm?: string } = {};
    if (password.current && password.current.length < 8) {
      errors.current = "Current password must be at least 8 characters.";
    }
    if (password.new && password.new.length < 8) {
      errors.new = "New password must be at least 8 characters.";
    } else if (password.new && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password.new)) {
      errors.new = "Password must contain uppercase, lowercase, number, and special character.";
    }
    if (password.confirm && password.new !== password.confirm) {
      errors.confirm = "Passwords do not match.";
    }
    setPasswordErrors(errors);
  }, [password]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setPasswordServerError(null);
    try {
      const res = await fetch("/api/superadmin/settings/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(password),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully");
        setPassword({ current: "", new: "", confirm: "" });
        setPasswordServerError(null);
      } else {
        setPasswordServerError(data.error || "Failed to update password");
        toast.error(data.error || "Failed to update password");
      }
    } catch (err) {
      setPasswordServerError("Failed to update password");
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and password.</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <label className="block text-sm font-medium">Name</label>
            <Input
              placeholder="Name"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              disabled={loading}
            />
            {profileErrors.name && <div className="text-red-600 text-xs">{profileErrors.name}</div>}
            <label className="block text-sm font-medium">Email</label>
            <Input
              placeholder="Email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              disabled={loading}
            />
            {profileErrors.email && <div className="text-red-600 text-xs">{profileErrors.email}</div>}
            <Button onClick={handleSaveProfile} disabled={loading || !!profileErrors.name || !!profileErrors.email}>Save Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <label className="block text-sm font-medium">Current Password</label>
            <Input
              type="password"
              placeholder="Current Password"
              value={password.current}
              onChange={e => setPassword({ ...password, current: e.target.value })}
              disabled={loading}
            />
            {passwordErrors.current && <div className="text-red-600 text-xs">{passwordErrors.current}</div>}
            <label className="block text-sm font-medium">New Password</label>
            <Input
              type="password"
              placeholder="New Password"
              value={password.new}
              onChange={e => setPassword({ ...password, new: e.target.value })}
              disabled={loading}
            />
            {passwordErrors.new && <div className="text-red-600 text-xs">{passwordErrors.new}</div>}
            <label className="block text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={password.confirm}
              onChange={e => setPassword({ ...password, confirm: e.target.value })}
              disabled={loading}
            />
            {passwordErrors.confirm && <div className="text-red-600 text-xs">{passwordErrors.confirm}</div>}
            {passwordServerError && <div className="text-red-600 text-xs mt-2">{passwordServerError}</div>}
            <Button onClick={handleChangePassword} disabled={loading || !!passwordErrors.current || !!passwordErrors.new || !!passwordErrors.confirm}>Change Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 