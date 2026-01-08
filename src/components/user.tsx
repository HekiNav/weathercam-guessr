import { User } from "@prisma/client";
import CopyItem from "./copy";
import moment from "moment"

export default function UserUI({ user }: { user: User }) {
    return (
        <div className="flex flex-col p-4 font-sans">
            <div className="flex flex-row bg-green-600 rounded-xl p-4 text-2xl font-mono text-white items-center">
                {user?.name}  <CopyItem prefix="ID:" content={user.id}></CopyItem>
                <span hidden={!user.admin} className="text-xs text-red-600 bg-white rounded px-1 h-min ml-1">admin</span>
            </div>
            <div className="py-1">
                Created {moment(user?.createdAt).fromNow()}
            </div>
        </div>
    )
}