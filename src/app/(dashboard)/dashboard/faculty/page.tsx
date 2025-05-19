import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Faculty Dashboard",
};

export default function FacultyPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">Faculty Dashboard</h1>
			<div className="grid gap-6">
				{/* Add your faculty dashboard content here */}
				<p>Welcome to the Faculty Dashboard</p>
			</div>
		</div>
	);
} 