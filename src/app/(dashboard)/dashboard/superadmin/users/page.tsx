"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { CreateUserDialog } from "@/components/dialogs/create-user-dialog";
import { UserManagementTable } from "@/components/tables/user-management-table";
import type { User } from "@/lib/utils/current-user";
import { listAdminAndFacultyUsers } from "@/actions/superadmin-users.actions";

export default function UserManagementPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const result = await listAdminAndFacultyUsers();
      if (result.success) {
        setUsers(result.users ?? []);
        setLoading(false);
      } else {
        setError("Failed to load users");
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-gray-400 mt-1">Manage administrators and faculty members.</p>
        </div>
        <Button 
          onClick={() => setIsCreateUserOpen(true)} 
          className="bg-blue-600 text-white hover:bg-blue-700 shadow-md"
        >
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