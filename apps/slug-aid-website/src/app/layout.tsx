import AnalyticsInitializer from "@/utils/analytics-initializer";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Slug Aid",
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
			<AnalyticsInitializer />
			<body className={"antialiased"}>{children}</body>
		</html>
	);
}
