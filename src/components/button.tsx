"use client"
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onPress?: (e: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button(propsWithOnPress: ButtonProps) {
    const {onPress, ...props} = propsWithOnPress
    return (<button
        {...{
            ...props,
            onClick: (e) => { props.onClick && props.onClick(e); onPress && onPress(e) },
            onKeyDown: (e) => { props.onKeyDown && props.onKeyDown(e); e.key == "Enter" && onPress && onPress(e) }, className: `active:bg-green-700 cursor-pointer rounded shadow-xl/20 p-2 ${props.disabled ? "bg-green-700" : "bg-green-600"} ${props.className}`
        }}
    >
        {props.children}
    </button>)
}
