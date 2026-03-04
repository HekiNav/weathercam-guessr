import React, { useState } from "react";
import ImageWithTime from "./imagewithtime";
import { ImagePresetHistory } from "@/lib/definitions";
import { Image } from "@/app/actions/image";

export interface ImageWithBlurProps extends React.HTMLAttributes<HTMLDivElement> {
    image: Image,
    time?: number,
    blur: {
        x: number,
        y: number,
        width: number,
        height: number
    }
}

export default function ImageWithBlur(props: ImageWithBlurProps) {
    const [imageHistory, setImageHistory] = useState<ImagePresetHistory | null>(null)
    if (!imageHistory && props.time) fetch(`https://tie.digitraffic.fi/api/weathercam/v1/stations/${props.image.externalId}/history`).then(res => res.json()).then(data => {
        setImageHistory(data as ImagePresetHistory)
    })
    return (
        <div {...props} className={`relative z-10 ${props.className}`}>
            <ImageWithTime image={props.image} time={props.time || -1} presetHistory={imageHistory} className="image max-h-100 absolute left-0 right-0" style={{ zIndex: -100 }} />
            <ImageWithTime image={props.image} time={props.time || -1} presetHistory={imageHistory} className="max-h-100 relative" style={{
                zIndex: -10,
                outline: "10px solid white",
                filter: "blur(4px)",
                objectFit: "contain",
                objectPosition: "left top",
                clipPath: `inset(${percent(props.blur.y)} ${percent(100 - props.blur.width)} ${percent(100 - props.blur.height)} ${percent(props.blur.x)} )`
            }} alt="" />
        </div>
    )
}
export function px(x: number | string) {
    return `${x}px`
}
export function percent(x: number | string) {
    return `${x}%`
}