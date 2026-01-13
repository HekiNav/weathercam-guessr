import { rib } from "@/lib/definitions";
import { HTMLAttributes } from "react";

export default function PlaceholderImage(props: HTMLAttributes<HTMLDivElement>) {
    return (<div {...props} className={`h-30 ${props.className}`} style={{
        backgroundImage: "url(/background-tile-green-inverted.png)",
        backgroundSize: "10em",
        backgroundPosition: `${rib(1, 100)}em ${rib(1, 100)}em`
    }}></div>)
}