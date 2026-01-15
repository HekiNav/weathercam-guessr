"use server"
import Button from "@/components/button";
import PlaceholderImage from "@/components/placeholderimage";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
	const user = await getCurrentUser()
	return (
		<div className="m-4">
			<h1 className="font-mono text-5xl text-green-600">
				Weathercam-guessr
			</h1>
			<div className="flex-row flex mt-4 shrink-1">
				<p className="max-w-150">
					A geoguessr-like game powered by <Link className="text-green-600 underline" href="https://www.digitraffic.fi/tieliikenne/">Fintraffic's weather camera API. </Link> Play on your own, or with friends, or even without an account*.
					<br />
					<small>*Practice only</small>
				</p>
				<PlaceholderImage className="rounded-3xl h-60 grow-2"></PlaceholderImage>	
			</div>

			<div className="flex flex-row mt-4 text-xl font-medium">
				{user ? (
					<div>
						<Link href="/play"><Button>Play</Button></Link> or <Link href="/user/me"><Button>View profile</Button></Link>
					</div>
				) : (
					<div>
						<Link href="/play/practice"><Button>Practice without account</Button></Link> or <Link href="/login"><Button>Log in</Button></Link>
					</div>
				)}
			</div>
		</div>
	);
}
