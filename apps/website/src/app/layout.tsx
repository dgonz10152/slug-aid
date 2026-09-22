import AnalyticsInitializer from "@/utils/analytics-initializer";
import "./globals.css";
import { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
	title: "Pantry Pal",
	description:
		"The University of California website for navigating the basic needs facilities.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<AnalyticsInitializer />
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
