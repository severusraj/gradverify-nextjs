"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { CreateUserDialog } from "@/components/dialogs/create-user-dialog";
import { UserManagementTable } from "@/components/tables/user-management-table";
import type { User } from "@/lib/utils/current-user";

export default function UserManagementPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/superadmin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || data.data?.users || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load users");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-lg mt-1">Manage administrators and faculty members.</p>
        </div>
        <Button onClick={() => setIsCreateUserOpen(true)} size="lg" className="bg-primary text-white shadow-md hover:bg-primary/90">
          <UserPlus className="w-5 h-5 mr-2" />
          Create User
        </Button>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {loading ? (
          <div>Loading users...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <UserManagementTable users={users} />
        )}
      </div>

      {/* Create User Dialog */}
      <CreateUserDialog 
        open={isCreateUserOpen}
        onOpenChange={setIsCreateUserOpen}
      />
    </div>
  );
} 