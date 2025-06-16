"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit2, Users2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listAdminAndFacultyUsers, deleteAdminOrFacultyUser } from "@/actions/superadmin-users.actions";
import type { User } from "@/lib/utils/current-user";
import { EditUserDialog } from "@/components/dialogs/edit-user-dialog";

export function UserManagementTable({ users: propUsers }: { users?: User[] }) {
  const [users, setUsers] = useState<User[]>(propUsers || []);
  const [isLoading, setIsLoading] = useState(!propUsers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editUser, setEditUser] = useState<User | null>(null);

  // Filtered and paginated users
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (!propUsers) {
      const fetchUsers = async () => {
        try {
          const result = await listAdminAndFacultyUsers();
          if (result.success) setUsers(result.users ?? []);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    } else {
      setUsers(propUsers);
      setIsLoading(false);
    }
  }, [propUsers]);

  useEffect(() => {
    setPage(1); // Reset to first page on search
  }, [search]);

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteAdminOrFacultyUser({ id: userId });
      if (result.success) {
        toast.success("User deleted successfully");
        if (!propUsers) {
          // Refresh users list only if fetching internally
          const res = await listAdminAndFacultyUsers();
          if (res.success) setUsers(res.users ?? []);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs bg-gray-800 border-gray-600 focus:ring-blue-500"
            />
            <div className="text-sm text-gray-400">
              Showing {paginatedUsers.length} of {filteredUsers.length} users
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Created At</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800">
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">
                    {user.role.toLowerCase().replace("_", " ")}
                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setEditUser(user)}
                          className="cursor-pointer"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="cursor-pointer text-red-500 hover:!text-red-500 hover:!bg-red-500/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Users2 className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-muted-foreground">No users found</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4 mt-4 border-t border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-gray-800 border-gray-600 hover:bg-gray-700"
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                  className={
                    page === i + 1
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                  }
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-gray-800 border-gray-600 hover:bg-gray-700"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={!!editUser}
        user={editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
        onUpdated={(updated) => {
          // Update local list
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? (updated as User) : u)));
        }}
      />
    </>
  );
} 