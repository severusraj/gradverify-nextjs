import type { Metadata } from "next";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";

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
			<ClientNavbarWrapper />
			{children}
		</div>
	);
}
