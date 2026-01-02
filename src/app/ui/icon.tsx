import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { PropsWithChildren } from "react";

export interface IconProps extends FontAwesomeIconProps, PropsWithChildren {
    boxed?: boolean
    small?: boolean
}

export default function Icon(props: IconProps) {
    return (
        <div className={`${props.className || ""} flex items-center`}>
            <FontAwesomeIcon {...{...props, className: `${props.className}`}} widthAuto></FontAwesomeIcon>
        </div>
    )
} 