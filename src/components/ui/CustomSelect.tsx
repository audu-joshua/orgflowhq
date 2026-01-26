"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Loader2 } from "lucide-react"

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
    required?: boolean
    disabled?: boolean
    isLoading?: boolean
    id?: string
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    required = false,
    disabled = false,
    isLoading = false,
    id
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const isDisabled = disabled || isLoading

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                id={id}
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                disabled={isDisabled}
                className={`w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between transition-colors ${isDisabled ? "opacity-50 cursor-not-allowed bg-muted" : "cursor-pointer hover:bg-muted/50"}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
                    <span className={`truncate ${selectedOption ? "text-foreground" : "text-muted-foreground"}`}>
                        {isLoading ? "Loading..." : (selectedOption ? selectedOption.label : placeholder)}
                    </span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value)
                                setIsOpen(false)
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors cursor-pointer ${value === option.value ? "bg-muted text-foreground font-medium" : "text-foreground"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Hidden input for form validation */}
            {required && (
                <input
                    type="text"
                    value={value}
                    onChange={() => { }}
                    required
                    className="sr-only"
                    tabIndex={-1}
                />
            )}
        </div>
    )
}
