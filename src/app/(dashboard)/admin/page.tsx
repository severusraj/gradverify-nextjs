import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin Dashboard",
};

export default function AdminPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
			<div className="grid gap-6">
				{/* Add your admin dashboard content here */}
				<p>Welcome to the Admin Dashboard</p>
			</div>
		</div>
	);
} 