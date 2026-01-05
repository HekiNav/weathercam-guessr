import type { Metadata } from "next";
import { Karla, Share_Tech_Mono } from "next/font/google";
import { Toaster } from "sonner"
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
		<html lang="en" style={{height: "100%"}}>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${karla.variable} ${shareTechMono.variable} antialiased bg-white`}>
				<Toaster richColors position="top-right"></Toaster>

				<UserProvider user={user}>
					<div className="flex flex-col min-h-screen">
						<div className="min-h-screen shadow-lg/20 flex flex-col">
							<NavBar></NavBar>
							{children}
						</div>
						<footer className="p-8 w-full">
							<span className="text-green-600 font-mono mr-2">Weathercam-guessr</span>	© Hekinav {new Date().getFullYear()}
						</footer>
					</div>
				</UserProvider>

			</body>
		</html>
	);
}
