import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Student Dashboard",
};

export default function StudentPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
			<div className="grid gap-6">
				{/* Add your student dashboard content here */}
				<p>Welcome to the Student Dashboard</p>
			</div>
		</div>
	);
} 