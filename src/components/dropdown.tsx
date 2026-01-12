// Dropdown.js 

'use client'
import React, { ReactNode, useState } from 'react';
import Icon from './icon';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

export interface DropdownProps<T extends string> extends React.HTMLAttributes<HTMLDivElement> {
    items: DropdownItem<T>[],
    initial: ReactNode,
    onSet?: (item: DropdownItem<T>) => void
}
export interface DropdownItem<T extends string> {
    id: T | null,
    content: ReactNode
}

export default function Dropdown<T extends string>(props: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<DropdownItem<T>>({ id: null, content: props.initial });

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (item: DropdownItem<T>) => {
        setSelectedLanguage(item);
        setIsOpen(false);
        if (props.onSet) props.onSet(item)
    };

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                className="inline-flex justify-center w-full
                               rounded border-2 border-green-600 
                               shadow-lg/20 px-4 py-2 bg-white text-sm
                               font-medium text-black hover:bg-green-600"
                onClick={toggleDropdown}
            >
                {selectedLanguage.content}
                <Icon icon={faCaretDown}></Icon>
            </button>

            {isOpen && (
                <div className="origin-top-right absolute z-1000
                                    left-0 mt-2 w-56 rounded-md
                                    shadow-lg bg-white ring-2 ring-green-600
                                    ring-opacity-5 focus:outline-none">
                    <div>
                        {props.items.map(({ content, id }, index) => (
                            <a
                                key={index}
                                href="#"
                                className="block px-4 py-2
                                               text-sm text-black
                                               hover:bg-green-600"
                                onClick={() => handleSelect({ content, id })}
                            >
                                {content}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}