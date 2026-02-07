import { User } from "@/lib/definitions";
import CopyItem from "./copy";
import moment from "moment"
import Button from "./button";

export default function UserUI({ user, isCurrentUser = false }: { user: User, isCurrentUser?: boolean }) {
    return (
        <div className="flex flex-col p-4 font-sans">
            <div className="flex flex-row bg-green-600 rounded-xl p-4 text-2xl font-mono text-white items-center">
                {user?.name} {isCurrentUser && "(you)"}  <CopyItem prefix="ID:" content={user.id}></CopyItem>
                <span hidden={!user.admin} className="text-xs text-red-600 bg-white rounded px-1 h-min ml-1">admin</span>
            </div>
            <div className="py-1">
                Created {moment(user?.createdAt).fromNow()} &middot;
                Last seen {Math.abs(Date.now() - (user?.lastSeen || 0)) > 1000 * 3600 * 24 * 10 ? moment((user?.lastSeen || 0) - 1000 * 3600 * 24 * 8).fromNow() : "recently"}
            </div>
            <h1 className="font-medium text-lg text-green-600">Maps</h1>
            {user.maps?.length ? (
                <div></div>
            ) : (
                <>{isCurrentUser ? "You have" : "This user has"} no maps
                    {isCurrentUser && <Button className="w-fit">Create one</Button>}
                </>
            )}
            {user.friends?.length ? (
                <div></div>
            ) : (
                <>
                    {isCurrentUser ? "You have" : "This user has"} no friends
                </>
            )}
        </div>
    )
}