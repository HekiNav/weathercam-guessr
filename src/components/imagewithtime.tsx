import { Image } from "@/app/actions/image";
import { getImageUrl, ImagePresetHistory } from "@/lib/definitions";
import { HTMLProps } from "react"

export interface ImageWithTimeProps extends HTMLProps<HTMLImageElement> {
    time: number,
    presetHistory: ImagePresetHistory | null,
    image: Image
}
export default function ImageWithTime({ presetHistory, time, image, ...elementProps }: ImageWithTimeProps) {
    console.log(presetHistory)
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={getImageUrl(image.externalId, image.source, time, (presetHistory ? presetHistory.presets[0].history : []).map(p => ({ url: p.imageUrl, time: p.lastModified })))} {...{ ...elementProps, alt: elementProps.alt || "no alt text provided" }}></img>
    )
}