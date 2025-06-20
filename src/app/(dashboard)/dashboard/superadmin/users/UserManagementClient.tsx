"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { CreateUserDialog } from "@/components/dialogs/create-user-dialog";
import { UserManagementTable } from "@/components/tables/user-management-table";
import type { User } from "@/lib/utils/current-user";

interface Props {
  initialUsers: User[];
}

export default function UserManagementClient({ initialUsers }: Props) {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Table */}
      <UserManagementTable users={initialUsers} />

      {/* Dialog */}
      <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} />
    </div>
  );
} 