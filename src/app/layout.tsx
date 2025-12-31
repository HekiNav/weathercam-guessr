import type { Metadata } from "next";
import { Karla, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./ui/navbar";
import { getCurrentUser } from "@/lib/auth";
import UserProvider from "./user-provider";

const karla = Karla({
	variable: "--font-karla",
	subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
	variable: "--font-share-tech-mono",
	subsets: ["latin"],
	weight: "400"
})


export const metadata: Metadata = {
	title: "Weathercam-guessr",
	description: "",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await getCurrentUser()
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${karla.variable} ${shareTechMono.variable} antialiased`}>
				<UserProvider user={user}>
					<div className="flex flex-col min-h-screen">
						<NavBar></NavBar>
						{children}

					</div>
				</UserProvider>

			</body>
		</html>
	);
}
