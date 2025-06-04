"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { facultyUpdateProfile } from "@/actions/faculty.actions";


export default function FacultyProfilePage() {
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
  const [passwordStrength, setPasswordStrength] = useState<{
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  }>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Fetch current user on mount
  useEffect(() => {
    (async () => {
      const { getCurrentUserServer } = await import("@/actions/current-user.actions");
      const data = await getCurrentUserServer();
      if (data.user) {
        setProfile({ name: data.user.name, email: data.user.email });
      }
    })();
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
    
    // Current password validation
    if (password.current && password.current.length < 8) {
      errors.current = "Current password must be at least 8 characters.";
    }

    // New password validation
    if (password.new) {
      const hasLength = password.new.length >= 8;
      const hasUppercase = /[A-Z]/.test(password.new);
      const hasLowercase = /[a-z]/.test(password.new);
      const hasNumber = /\d/.test(password.new);
      const hasSpecial = /[@$!%*?&]/.test(password.new);

      setPasswordStrength({
        length: hasLength,
        uppercase: hasUppercase,
        lowercase: hasLowercase,
        number: hasNumber,
        special: hasSpecial,
      });

      if (!hasLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        errors.new = "Password does not meet requirements.";
      }
    }

    // Confirm password validation
    if (password.confirm && password.new !== password.confirm) {
      errors.confirm = "Passwords do not match.";
    }

    setPasswordErrors(errors);
  }, [password]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await facultyUpdateProfile(profile);
      if (result.success) {
        toast.success("Profile updated successfully");
        // Re-fetch current user to update UI
        const { getCurrentUserServer } = await import("@/actions/current-user.actions");
        const data = await getCurrentUserServer();
        if (data.user) {
          setProfile({ name: data.user.name, email: data.user.email });
        }
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setPasswordServerError(null);
    try {
      const res = await fetch("/api/faculty/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully");
        setPassword({ current: "", new: "", confirm: "" });
        setPasswordServerError(null);
        setPasswordStrength({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        });
      } else {
        setPasswordServerError(data.error || "Failed to update password");
        toast.error(data.error || "Failed to update password");
      }
    } catch {
      setPasswordServerError("Failed to update password");
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={met ? "text-green-500" : "text-red-500"}>{text}</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Faculty Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile and password.
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                disabled={loading}
              />
              {profileErrors.name && <div className="text-red-600 text-xs">{profileErrors.name}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                disabled={loading}
              />
              {profileErrors.email && <div className="text-red-600 text-xs">{profileErrors.email}</div>}
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={loading || !!profileErrors.name || !!profileErrors.email}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Current Password"
                value={password.current}
                onChange={e => setPassword({ ...password, current: e.target.value })}
                disabled={loading}
              />
              {passwordErrors.current && <div className="text-red-600 text-xs">{passwordErrors.current}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="New Password"
                value={password.new}
                onChange={e => setPassword({ ...password, new: e.target.value })}
                disabled={loading}
              />
              {passwordErrors.new && <div className="text-red-600 text-xs">{passwordErrors.new}</div>}
              
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <PasswordRequirement
                  met={passwordStrength.length}
                  text="At least 8 characters long"
                />
                <PasswordRequirement
                  met={passwordStrength.uppercase}
                  text="Contains uppercase letter"
                />
                <PasswordRequirement
                  met={passwordStrength.lowercase}
                  text="Contains lowercase letter"
                />
                <PasswordRequirement
                  met={passwordStrength.number}
                  text="Contains number"
                />
                <PasswordRequirement
                  met={passwordStrength.special}
                  text="Contains special character (@$!%*?&)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm New Password"
                value={password.confirm}
                onChange={e => setPassword({ ...password, confirm: e.target.value })}
                disabled={loading}
              />
              {passwordErrors.confirm && <div className="text-red-600 text-xs">{passwordErrors.confirm}</div>}
            </div>
            {passwordServerError && <div className="text-red-600 text-xs mt-2">{passwordServerError}</div>}
            <Button 
              onClick={handleChangePassword} 
              disabled={loading || !!passwordErrors.current || !!passwordErrors.new || !!passwordErrors.confirm}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 