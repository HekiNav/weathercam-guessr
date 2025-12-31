import { PropsWithChildren, ReactNode } from "react";

export interface CardProps extends PropsWithChildren {
    title?: ReactNode,
    className?: string
}
export default function Card({ title, children, className }: CardProps) {
    return (
        <div className={"w-80 rounded-2xl shadow-xl/30 flex items-center flex-col pb-4 font-sans " + className}>
            <div hidden={!title} className="bg-green-600 w-full p-4 rounded-t-2xl font-mono mb-4">{title}</div>
            {children}
        </div>
    )
}