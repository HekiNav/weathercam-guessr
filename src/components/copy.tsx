"use client"
import { faCheck, faCopy, faX } from "@fortawesome/free-solid-svg-icons";
import Icon from "./icon";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function CopyItem({content, prefix}:{content: string, prefix: string}){
    const [icon, setIcon] = useState(faCopy)
    return (
        <span className="text-xs text-gray-700 bg-white rounded px-1 h-min ml-6">
            {prefix}
            {content}
            <button className="ml-1">
                <Icon icon={icon} size="xs" onClick={() => {
                    navigator.clipboard.writeText(content).then(() => {
                        setIcon(faCheck)
                        setTimeout(() => setIcon(faCopy), 1000)
                    }).catch((err) => {
                        setIcon(faX)
                        setTimeout(() => setIcon(faCopy), 1000)
                        toast(err)
                    })
                }}></Icon>
            </button>
        </span>
    )
}