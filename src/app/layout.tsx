import type { Metadata } from "next";
import { Karla, Share_Tech_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast"
import "./globals.css";
import NavBar from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth";
import UserProvider from "./user-provider";
import { getNotifications } from "@/lib/notification";

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
	const notifications = user && await getNotifications({user: user.id})
	return (
		<html lang="en" style={{height: "100%"}}>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${karla.variable} ${shareTechMono.variable} antialiased bg-white h-full`}>
				<Toaster position="top-right" containerClassName="mt-10"></Toaster>

				<UserProvider user={user} notifs={notifications? notifications.map(n => ({...n, read: n.read == "true"})) : null}>
					<div className="flex flex-col min-h-screen overflow-scroll">
						<div className="min-h-screen shadow-lg/20 flex flex-col grow shrink-0">
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
