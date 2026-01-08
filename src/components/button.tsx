import React from "react";

export default function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (<button
        {...{ ...props, className: `bg-green-600 rounded shadow-xl/20 p-2 ${props.className}` }}
    >
        {props.children}
    </button>)
}
