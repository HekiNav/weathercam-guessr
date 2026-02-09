"use client"

import Card from "@/components/card"
import { useContext, useState } from "react"
import { NotificationContext } from "../user-provider"
import { Notification } from "@/lib/definitions"
import Modal from "@/components/modal"
import Icon from "@/components/icon"
import { faEnvelope, faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons"
import Button from "@/components/button"

export default function InboxPage() {
    const [modalState, setModalState] = useState<Notification | null>(null)
    const notifs = useContext(NotificationContext)
    return <div className="flex w-full h-full flex-col items-center py-10 px-10">
        <Card title="inbox" className="lg:w-6/10! w-full!">
            <span className=" divide-y-2 w-full px-3">
                {...(notifs || [])?.map((n, i) => (
                    <div key={i} className="px-1 py-2 w-full cursor-pointer flex flex-row justify-between items-center" >
                        <div onClick={() => {
                            setModalState(n)
                        }} className={`${!n.read && "font-bold "}text-lg`}>{n.title}</div>
                    </div>
                ))}
                {notifs?.length == 0 && (
                    <>
                        No notifications yet
                    </>
                )}
            </span>
            {modalState && (
                <Modal open={!!modalState} title={modalState.title} close={() => setModalState(null)} className="w-max">
                    <div className="px-4 notification" dangerouslySetInnerHTML={{ __html: modalState.message }}></div>
                </Modal>
            )}
        </Card>
    </div>
}