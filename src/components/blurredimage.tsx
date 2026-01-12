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
        <div {...props} style={{
            backgroundImage: `url(${props.src})`,
            backgroundSize: "100%",
            backgroundRepeat: "no-repeat",
            overflow: "hidden"
        }}>

            <img className="max-h-100" style={{
                margin: "-5px -10px -10px -5px",
                height: "100%",
                filter: "blur(4px)",
                backgroundSize: "100%",
                backgroundRepeat: "no-repeat",
                clipPath: `inset(${percent(props.blur.y)} ${percent(100-props.blur.width)} ${percent(100-props.blur.height)} ${percent(props.blur.x)} )`
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