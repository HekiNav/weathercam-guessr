"use server"
import Button from "@/components/button";
import { getCurrentUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
	const user = await getCurrentUser()
	return (
		<div className="m-4">
			<h1 className="font-mono text-5xl text-green-600">
				Weathercam-guessr
			</h1>
			<div className="flex-row flex mt-4 shrink-1">
				<p className="max-w-150 text-lg">
					A geoguessr-like game powered by <Link className="text-green-600 underline" href="https://www.digitraffic.fi/tieliikenne/">Fintraffic&apos;s weather camera API. </Link> Play on your own, 
					 with friends, or even without an account*.
					<br />
					<small>*Practice mode only</small>
					<br  className="mb-4"/>
					Practice your skills, play the daily challenge, or create your own map from the hand-reviewed selection of 2500+ different images.
				</p>
				<div className="max-h-screen h-100 w-full relative max-w-300">
					<Image fill objectFit="cover" style={{objectPosition: "50% 50%"}} alt="Image of a map with image locations" src="/main.png"></Image>
				</div>
			</div>

			<div className="flex flex-row mt-4 text-xl font-medium gap-2">
				{user ? (
					<>
						<Link href="/play"><Button>Play</Button></Link>
						<Link href="/user/me"><Button>View profile</Button></Link>
						<Link href="/map/new"><Button>Create a map</Button></Link>
					</>
				) : (
					<>
						<Link href="/play/practice"><Button>Practice without account</Button></Link>
						<Link href="/login"><Button>Log in</Button></Link>
					</>
				)}
			</div>
		</div>
	);
}
