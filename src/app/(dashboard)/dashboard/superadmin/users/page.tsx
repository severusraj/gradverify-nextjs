import dynamic from "next/dynamic";
import { listAdminAndFacultyUsers } from "@/actions/superadmin-users.actions";

// Dynamically import the client component with no SSR to keep bundle small
const UserManagementClient = dynamic(() => import("./UserManagementClient"));

export default async function UserManagementPage() {
  const result = await listAdminAndFacultyUsers();
  const users = result.success ? result.users ?? [] : [];

  return <UserManagementClient initialUsers={users} />;
} 