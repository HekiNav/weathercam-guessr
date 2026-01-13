import React from "react";

export interface ImageWithBlurProps extends React.HTMLAttributes<HTMLDivElement> {
    src: string,
    alt: string,
    blur: {
        x: number,
        y: number,
        width: number,
        height: number
    }
}

export default function ImageWithBlur(props: ImageWithBlurProps) {
    return (
        <div {...props} className={`relative ${props.className}`}>
            <img className="image max-h-100 absolute left-0 right-0" src={props.src} />
            <img className="max-h-100" style={{
                outline: "10px solid white",
                filter: "blur(4px)",
                objectFit: "contain",
                objectPosition: "left top",
                clipPath: `inset(${percent(props.blur.y)} ${percent(100 - props.blur.width)} ${percent(100 - props.blur.height)} ${percent(props.blur.x)} )`
            }} src={props.src} alt="" />
        </div>
    )
}
export function px(x: number | string) {
    return `${x}px`
}
export function percent(x: number | string) {
    return `${x}%`
}