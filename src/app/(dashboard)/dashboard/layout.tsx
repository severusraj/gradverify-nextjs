import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default function DashboardPageLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return <div>{children}</div>;
}
