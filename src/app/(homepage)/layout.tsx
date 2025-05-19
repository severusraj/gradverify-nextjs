import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
	title: "Home",
};

export default function HomePageLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return (
		<div>
			<Navbar />
			{children}
		</div>
	);
}
