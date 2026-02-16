import { PropsWithChildren, ReactNode } from "react";

export interface CardProps extends PropsWithChildren {
    title?: ReactNode,
    className?: string,
    imageCard?: boolean
    small?: boolean
}
export default function Card({ title, children, className, imageCard = false , small = false}: CardProps) {
    return (
        <div className={`w-80 flex flex-col  ${small ? "rounded-lg shadow-lg/10" : "rounded-2xl shadow-xl/30"}  flex items-center flex-col ${small ? "pb-2" : "pb-4 "} font-sans ` + className}>
            <div hidden={!title} className={`bg-green-600 w-full  ${small ? "rounded-t-lg" : "rounded-t-2xl"} font-mono ${imageCard || small ? "" : "mb-4"} ${small ? "py-1 px-2" : "p-4 "}`}>{title}</div>
            {children}
        </div>
    )
}