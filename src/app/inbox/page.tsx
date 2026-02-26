"use client"

import Card from "@/components/card"
import { useContext, useState } from "react"
import { NotificationContext } from "../user-provider"
import { doServer, FriendState, momentToTZ, Notification, NotificationType } from "@/lib/definitions"
import Modal from "@/components/modal"
import Icon from "@/components/icon"
import { faEnvelope, faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons"
import { markAsRead } from "../actions/inbox"
import Button from "@/components/button"
import toast from "react-hot-toast"
import { respondToFriendRequest } from "../actions/user"
import { useRouter } from "next/navigation"

export default function InboxPage() {
    const [modalState, setModalState] = useState<Notification | null>(null)
    const [notifs, reloadNotifs] = useContext(NotificationContext)
    const router = useRouter()
    return <div className="flex w-full h-full flex-col items-center py-10 px-10">
        <Card cardTitle="inbox" className="lg:w-6/10! w-full!">
            <span className=" divide-y-2 w-full px-3">
                {...(notifs || [])?.sort((a,b) =>  new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()).map((n, i) => (
                    <div key={i} className="px-1 py-2 w-full cursor-pointer flex flex-row justify-between items-center" >
                        <div onClick={() => {
                            setModalState(n)
                            if (!n.read) markAsRead(n.id).then(() => {
                                if (reloadNotifs) reloadNotifs()
                            })
                        }} className={`${!n.read && "font-bold "}text-lg`}>
                            <span className="px-1">{momentToTZ(n.creationTime).fromNow()}</span>
                            <span className="px-1 text-green-600">{n.title}</span>
                        </div>
                        <Icon icon={n.read ? faEnvelopeOpen : faEnvelope}></Icon>
                    </div>
                ))}
                {notifs?.length == 0 && (
                    <>
                        No notifications yet
                    </>
                )}
            </span>
            {modalState && (
                <Modal open={!!modalState} title={modalState.title} close={() => {
                    setModalState(null)
                }} className="w-max">
                    <div className="px-4 notification" dangerouslySetInnerHTML={{ __html: modalState.message }}></div>
                    {modalState.type == NotificationType.FRIEND_REQUEST && <div className="w-full flex justify-around mt-5">
                        <Button onClick={() => {
                            if (modalState.senderId) toast.promise(doServer(respondToFriendRequest(modalState.senderId, FriendState.ACCEPTED)), {
                                loading: "Accepting",
                                success: "Accepted",
                                error: (err) => err.message
                            }).then(() => {
                                setModalState(null)
                                router.refresh()
                            }).catch(() => {
                                setModalState(null)
                            })
                        }}>Accept</Button>
                        <Button onClick={() => {
                            if (modalState.senderId) toast.promise(doServer(respondToFriendRequest(modalState.senderId, FriendState.REJECTED)), {
                                loading: "Rejecting",
                                success: "Rejected",
                                error: (err) => err.message
                            }).then(() => {
                                setModalState(null)
                                router.refresh()
                            }).catch(() => {
                                setModalState(null)
                            })
                        }} className="bg-red-600">Reject</Button>
                    </div>}
                </Modal>
            )}
        </Card>
    </div>
}