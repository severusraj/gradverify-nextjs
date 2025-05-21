"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SuperAdminSettingsPage() {
  const [profile, setProfile] = useState({
    name: "Super Admin",
    email: "admin@example.com",
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, password, and system preferences.</p>
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
            />
            <label className="block text-sm font-medium">Email</label>
            <Input
              placeholder="Email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
            />
            <Button>Save Profile</Button>
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
            />
            <label className="block text-sm font-medium">New Password</label>
            <Input
              type="password"
              placeholder="New Password"
              value={password.new}
              onChange={e => setPassword({ ...password, new: e.target.value })}
            />
            <label className="block text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={password.confirm}
              onChange={e => setPassword({ ...password, confirm: e.target.value })}
            />
            <Button>Change Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* System Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <p className="text-muted-foreground">System preferences and notification settings will go here.</p>
            <Button disabled>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 