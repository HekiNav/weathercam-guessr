import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { PropsWithChildren } from "react";

export interface IconProps extends FontAwesomeIconProps, PropsWithChildren {
    boxed?: boolean
    small?: boolean
}

export default function Icon(props: IconProps) {
    return (
        <div className={`${props.className || ""} flex items-center`}>
            <FontAwesomeIcon {...{...props, small: undefined, className: `${props.className} ${props.small ? "w-3! h-3!" : "w-5! h-5!"}`}} widthAuto></FontAwesomeIcon>
        </div>
    )
} 