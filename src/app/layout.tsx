import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		default: "GradVerify",
		template: "%s | GradVerify",
	},
	description:
		"GradVerify is a secure and efficient platform for alumni to request and verify their academic documents.",
	appleWebApp: {
		title: "GradVerify",
	},
	applicationName: "GradVerify",
	openGraph: {
		siteName: "GradVerify",
		type: "website",
		title: "GradVerify",
		url: "https://gc-gradverify.space",
	},
};

export default function RootLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster richColors />
				</ThemeProvider>
			</body>
		</html>
	);
}
