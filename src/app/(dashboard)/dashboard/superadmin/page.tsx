import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Super Admin Dashboard",
};

export default function SuperAdminPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
			<div className="grid gap-6">
				{/* Add your superadmin dashboard content here */}
				<p>Welcome to the Super Admin Dashboard</p>
			</div>
		</div>
	);
} 