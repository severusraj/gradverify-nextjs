import "@/styles/globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "GradVerify",
		template: "%s | GradVerify",
	},
	description: "GradVerify for students of Gordon College",
	appleWebApp: {
		title: "GradVerify",
	},
	applicationName: "GradVerify",
	openGraph: {
		siteName: "GradVerify",
		type: "website",
		title: "GradVerify",
	},
};

export default function RootLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={`${manrope.className} bg-background text-foreground antialiased`}
			>
				<div>{children}</div>
				<Toaster position="top-center" />
			</body>
		</html>
	);
}
