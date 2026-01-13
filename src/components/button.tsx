import React from "react";

export default function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (<button
        {...{ ...props, className: `active:bg-green-700 rounded shadow-xl/20 p-2 ${props.disabled ? "bg-green-700" : "bg-green-600"} ${props.className}` }}
    >
        {props.children}
    </button>)
}
