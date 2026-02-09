import { FriendState, momentToTZ, User } from "@/lib/definitions";
import CopyItem from "./copy";
import moment from "moment"
import Button from "./button";
import Link from "next/link";
import Card from "./card";

export default function UserUI({ user, isCurrentUser = false }: { user: User, isCurrentUser?: boolean }) {
    return (
        <div className="flex flex-col p-4 pb-0 font-sans">
            <div className="flex flex-row bg-green-600 rounded-xl p-4 text-2xl font-mono text-white items-center">
                {user?.name} {isCurrentUser && "(you)"}  <CopyItem prefix="ID:" content={user.id}></CopyItem>
                <span hidden={!user.admin} className="text-xs text-red-600 bg-white rounded px-1 h-min ml-1">admin</span>
            </div>
            <div className="py-1">
                Created {moment(user?.createdAt).fromNow()} &middot;
                Last seen {Math.abs(Date.now() - (user?.lastSeen || 0)) > 1000 * 3600 * 24 * 10 ? moment((user?.lastSeen || 0) - 1000 * 3600 * 24 * 8).fromNow() : "recently"}
            </div>
            <h1 className="font-medium text-xl text-green-600">Maps</h1>
            {user.maps?.length ? (
                <div></div>
            ) : (
                <>{isCurrentUser ? "You have" : "This user has"} no maps
                    {isCurrentUser && <Link href="/map/new/"><Button className="w-fit">Create one</Button></Link>}
                </>
            )}
            <h1 className="font-medium text-xl text-green-600 mt-4 mb-1">Friends</h1>
            {user.friends?.length ? (
                <div className="flex flex-row flex-wrap gap-4">{
                    ...user.friends.filter(f => f.state != FriendState.REJECTED).map((f, i) => (
                        <Link key={i} href={`/user/${(f.user1id == user.id ? f.user2 : f.user1)?.id}/`}>
                            <Card className="w-40!" small title={(<span className="font-bold">{(f.user1id == user.id ? f.user2 : f.user1)?.name}</span>)}>
                                <span className={`mt-2 text-sm ${f.state == FriendState.ACCEPTED ? "bg-green-600" : "bg-yellow-600"} rounded px-1 h-min ml-1`}>{f.state}</span>
                                {f.state == FriendState.ACCEPTED && (<>
                                    <span className="px-1 mt-1 text-sm">Friends since: </span>
                                    <span className={`bg-gray-300 rounded px-1 h-min ml-1`}>{momentToTZ(f.creationTime).format("Do MMM Y")}</span>
                                </>)}
                            </Card>
                        </Link>
                    ))
                }</div>
            ) : (
                <>
                    {isCurrentUser ? "You have" : "This user has"} no friends
                </>
            )}
        </div>
    )
}