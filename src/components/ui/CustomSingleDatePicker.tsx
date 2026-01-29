"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfToday,
    isSameDay,
    isAfter,
    startOfDay,
    parseISO
} from "date-fns"

interface CustomSingleDatePickerProps {
    value: string; // ISO format or YYYY-MM-DD
    onChange: (date: string) => void;
    placeholder?: string;
    label?: string;
}

export function CustomSingleDatePicker({ value, onChange, placeholder = "Select Date" }: CustomSingleDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentViewDate, setCurrentViewDate] = useState(value ? new Date(value) : new Date())
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleDateClick = (date: Date) => {
        onChange(format(date, "yyyy-MM-dd"))
        setIsOpen(false)
    }

    const renderCalendar = () => {
        const start = startOfMonth(currentViewDate)
        const end = endOfMonth(currentViewDate)
        const startDay = start.getDay() // 0 for Sunday
        const daysInMonth = end.getDate()

        const days = []
        // Padding for start day
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`pad-${i}`} className="h-8 w-8" />)
        }

        const selectedDate = value ? startOfDay(new Date(value)) : null

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), i)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isToday = isSameDay(date, startOfToday())

            days.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={`h-8 w-8 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center relative
                        ${isSelected ? "bg-primary text-primary-foreground shadow-lg scale-105 z-10" : "hover:bg-muted text-foreground"}
                        ${isToday && !isSelected ? "border-2 border-primary/40" : ""}
                    `}
                >
                    {i}
                    {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
                </button>
            )
        }

        return days
    }

    const displayLabel = value ? format(new Date(value), "PPP") : placeholder

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 border border-border bg-background rounded-xl hover:border-primary/50 transition-all text-sm font-medium ${isOpen ? "ring-2 ring-primary/20 border-primary" : ""}`}
            >
                <CalendarIcon size={18} className="text-primary" />
                <span className={value ? "text-foreground" : "text-muted-foreground"}>
                    {displayLabel}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 p-3 bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-[220px]">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-bold text-foreground">
                                {format(currentViewDate, "MMMM yyyy")}
                            </h4>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setCurrentViewDate(subMonths(currentViewDate, 1))}
                                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentViewDate(addMonths(currentViewDate, 1))}
                                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 text-center mb-1.5">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                <span key={d} className="text-[9px] font-bold text-muted-foreground uppercase">{d}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                            {renderCalendar()}
                        </div>

                        <div className="mt-3 pt-2 border-t border-border flex justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    handleDateClick(new Date())
                                }}
                                className="text-[10px] font-bold text-primary hover:underline"
                            >
                                Select Today
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
