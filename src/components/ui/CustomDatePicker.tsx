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
    endOfToday,
    startOfYesterday,
    endOfYesterday,
    startOfWeek,
    endOfWeek,
    subDays,
    isSameDay,
    isWithinInterval,
    eachDayOfInterval,
    startOfYear,
    endOfYear,
    subMonths as subMonthsFn
} from "date-fns"

export type DateRange = {
    start: Date;
    end: Date;
    label?: string;
} | null;

interface CustomDatePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    placeholder?: string;
}

export function CustomDatePicker({ value, onChange, placeholder = "Select Date Range" }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentViewDate, setCurrentViewDate] = useState(new Date())
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

    const presets = [
        { label: "Today", getRange: () => ({ start: startOfToday(), end: endOfToday() }) },
        { label: "Yesterday", getRange: () => ({ start: startOfYesterday(), end: endOfYesterday() }) },
        { label: "This Week", getRange: () => ({ start: startOfWeek(new Date()), end: new Date() }) },
        { label: "This Month", getRange: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
        {
            label: "Last Month", getRange: () => {
                const lastMonth = subMonthsFn(new Date(), 1);
                return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
            }
        },
        { label: "This Year", getRange: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }) },
    ]

    const handlePresetClick = (preset: typeof presets[0]) => {
        const range = preset.getRange()
        onChange({ ...range, label: preset.label })
        setIsOpen(false)
    }

    const handleDateClick = (date: Date) => {
        if (!value || (value.start && value.end && !isSameDay(value.start, value.end))) {
            // Start new range
            onChange({ start: date, end: date })
        } else {
            // Complete range
            if (date < value.start) {
                onChange({ start: date, end: value.start })
            } else {
                onChange({ start: value.start, end: date })
            }
        }
    }

    const renderCalendar = () => {
        const start = startOfMonth(currentViewDate)
        const end = endOfMonth(currentViewDate)
        const startDay = start.getDay() // 0 for Sunday
        const daysInMonth = end.getDate()

        const days = []
        // Padding for start day
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`pad-${i}`} className="h-9 w-9" />)
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), i)
            const isSelected = value && (isSameDay(date, value.start) || isSameDay(date, value.end))
            const isInRange = value && isWithinInterval(date, { start: value.start, end: value.end })
            const isToday = isSameDay(date, startOfToday())

            days.push(
                <button
                    key={i}
                    onClick={() => handleDateClick(date)}
                    className={`h-11 w-11 text-sm font-bold rounded-xl transition-all flex items-center justify-center relative
                        ${isSelected ? "bg-primary text-primary-foreground shadow-lg scale-105 z-10" : ""}
                        ${isInRange && !isSelected ? "bg-primary/15 text-primary" : ""}
                        ${!isSelected && !isInRange ? "hover:bg-muted text-foreground" : ""}
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

    const displayLabel = value
        ? (value.label || `${format(value.start, "MMM d")} - ${format(value.end, "MMM d")}`)
        : placeholder

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-lg hover:border-primary/50 transition-all text-sm font-medium ${isOpen ? "ring-2 ring-primary/20 border-primary" : ""}`}
            >
                <CalendarIcon size={16} className="text-muted-foreground" />
                <span className={value ? "text-foreground" : "text-muted-foreground"}>
                    {displayLabel}
                </span>
                {value && (
                    <X
                        size={14}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation()
                            onChange(null)
                        }}
                    />
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 md:left-0 z-50 p-6 bg-card border border-border rounded-2xl shadow-2xl flex gap-8 animate-in fade-in zoom-in-95 duration-200 min-w-[520px] bg-card">
                    {/* Presets */}
                    <div className="w-40 flex flex-col gap-1 border-r border-border pr-6">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Presets</p>
                        {presets.map((p) => (
                            <button
                                key={p.label}
                                onClick={() => handlePresetClick(p)}
                                className={`text-left px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${value?.label === p.label ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendar View */}
                    <div className="flex-1 min-w-[320px]">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-foreground">
                                {format(currentViewDate, "MMMM yyyy")}
                            </h4>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentViewDate(subMonths(currentViewDate, 1))}
                                    className="p-1 hover:bg-muted rounded-md"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentViewDate(addMonths(currentViewDate, 1))}
                                    className="p-1 hover:bg-muted rounded-md"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 text-center mb-2">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                <span key={d} className="text-[10px] font-bold text-muted-foreground uppercase">{d}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {renderCalendar()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
