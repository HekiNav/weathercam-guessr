"use client"
import UserUI from "@/components/user";
import { UserContext } from "@/app/user-provider";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/button";
import Modal from "@/components/modal";
import { changeEmail, changeUsername, deleteUser, sendFriendRequest } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import { User } from "@/lib/definitions";
import { searchUser } from "@/lib/public";
import Icon from "@/components/icon";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function MyUserPage() {
    const user = useContext(UserContext)
    useEffect(() => {
        if (user) return
        toast("Log in first")
        redirect("/login?to=/user/me")
    })
    const [modalState, setModalState] = useState<"username" | "email" | "delete" | null>(null)

    const titles = {
        username: "Confirm username change",
        email: "Confirm email change",
        delete: "Confirm account deletion"
    }

    const [email, setEmail] = useState(user?.email)
    const [username, setUsername] = useState(user?.name || "")
    const [confirmation, setConfirmation] = useState(user?.name || "")

    const [friendQuery, setFriendQuery] = useState("")
    const [friendResults, setFriendResults] = useState<User[]>([])

    useEffect(() => {
        if (friendQuery) {
            searchUser(friendQuery).then(setFriendResults)
        } else {
            setFriendResults([])
        }
    }, [friendQuery])

    const router = useRouter()

    if (!user) {
        return <div></div>
    }
    return (
        <div>
            <UserUI user={user} isCurrentUser></UserUI>
            <div className="p-4 pt-1">
                <h1 className="text-md text-green-600 font-medium mb-4">Add friends</h1>
                <div className="my-1 border-black border-3 rounded-tl rounded-tr border-b-0 p-1 text-green-600 w-min relative">
                    <input
                        placeholder="Search for a user"
                        autoComplete="username"
                        type="username"
                        id="search_friend"
                        name="search_friend"
                        value={friendQuery}
                        onChange={(e) => setFriendQuery(e.target.value)}
                        className="outline-0"
                        onKeyDown={(e) => e.key == "Enter"}
                    />
                    <output className="absolute top-8 px-1 border-3 border-black border-t-0 left-[-3px] bg-white right-[-3px] rounded-br rounded-bl">
                        {...friendResults.map((f, i) => (
                            <div key={i} className="flex flex-row justify-between text-black w-full">
                                <Link href={`/user/${f.id}`} className="font-medium">{f.name}</Link> <Button onClick={() => {
                                    toast.promise(doServer(sendFriendRequest(f.id)), {
                                        loading: "Sending request",
                                        success: "Sent request!",
                                        error: (err) => err.message
                                    })
                                }} className="w-5 h-5 p-0! flex items-center align-center justify-center"><Icon icon={faPlus}></Icon></Button>
                            </div>
                        ))}
                    </output>
                </div>
            </div>
            <div className="p-4">
                <h1 className="text-lg text-green-600 font-medium mb-4">Edit details</h1>
                <label htmlFor="email">Update email</label><br />
                <input
                    placeholder="Email"
                    autoComplete="email"
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="my-1 border-black border-3 rounded p-1 text-green-600"
                    onKeyDown={(e) => e.key == "Enter"}
                />
                <Button className="ml-2 mb-4" onClick={() => user.email != email ? setModalState("email") : toast("You haven't changed anything!")}>Update</Button><br />
                <label htmlFor="username">Update username</label><br />
                <input
                    placeholder="Username"
                    autoComplete="username"
                    type="username"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="my-1 border-black border-3 rounded p-1 text-green-600"
                    onKeyDown={(e) => e.key == "Enter"}
                />
                <Button className="ml-2 mb-4" onClick={() => user.name != username ? setModalState("username") : toast("You haven't changed anything!")}>Update</Button>
                <h1 className="text-lg text-red-600 font-medium my-4">Delete account</h1>
                <Button className="bg-red-600" onClick={() => setModalState("delete")}>Delete</Button>
            </div>
            <Modal close={() => setModalState(null)} open={modalState != null} title={titles[modalState || "email"]}>
                {modalState == "delete" && <>
                    <h1 className="font-medium text-red-600 text-xl">Delete account?</h1>
                    <span className="mx-2">This will delete all information related to your account including: Custom maps, Leaderboard entries and User profile</span>
                    <span className="mt-2 text-red-600">Type {`"delete ${user.name}"`} to confirm</span>
                </>}
                {modalState == "username" && <>
                    <h1 className="font-medium text-green-600 text-xl">Change username?</h1>
                    <span className="mx-2">This action cannot be undone</span>
                    <span className="mt-2 text-green-600">Type {`"${username}"`} to confirm</span>
                </>}
                {modalState == "email" && <>
                    <h1 className="font-medium text-red-600 text-xl">Change email?</h1>
                    <span className="mx-2">This action cannot be undone. You will be logged out and the only way to log in is via your new email. Ensure you have access to {`"${email}"`}. Otherwise, you <b>will</b> lose your account forever.</span>
                    <span className="mt-2 text-red-600">Type {`"${email}"`} to confirm</span>
                </>}
                <input
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="my-1 border-black border-3 rounded p-1 text-black"
                />
                <Button onClick={() => {
                    switch (modalState) {
                        case "email":
                            if (confirmation == email) toast.promise(doServer(changeEmail(email)), {
                                loading: "Changing email",
                                success: "Changed email",
                                error: (err) => err.message
                            }).then(() => {
                                setModalState(null)
                                router.refresh()
                            }).catch(() => {
                                setModalState(null)
                            })
                            break;
                        case "username":
                            if (confirmation == username) toast.promise(doServer(changeUsername(username)), {
                                loading: "Changing username",
                                success: "Changed username",
                                error: (err) => err.message

                            }).then(() => {
                                setModalState(null)
                                router.refresh()
                            }).catch(() => {
                                setModalState(null)
                            })
                        case "delete":
                            if (confirmation == `delete ${user.name}`) toast.promise(doServer(deleteUser()), {
                                loading: "Deleting user",
                                success: "Deleted user",
                                error: (err) => err.message
                            }).then(() => {
                                setModalState(null)
                                router.refresh()
                            }).catch(() => {
                                setModalState(null)
                            })
                            break;
                        default:
                            break;
                    }
                }} className={modalState == "username" ? "bg-green-600" : "bg-red-600"}>Confirm</Button>
            </Modal>
        </div>
    )
}
function doServer(func: Promise<{ success: boolean, message: string } | undefined>) {
    return new Promise((res, rej) => {
        func.then((data) => {
            if (!data) return rej(data)
            if (data.success) res(data)
            else rej(data)
        })
    })
}