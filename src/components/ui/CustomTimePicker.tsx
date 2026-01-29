"use client"

import { useState, useRef, useEffect } from "react"
import { Clock, X, ChevronUp, ChevronDown } from "lucide-react"

interface CustomTimePickerProps {
    value: string; // HH:mm format
    onChange: (time: string) => void;
    placeholder?: string;
    iconColor?: string;
}

export function CustomTimePicker({ value, onChange, placeholder = "00:00", iconColor = "text-primary" }: CustomTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const parseTime = (val: string) => {
        if (!val) return { h: "09", m: "00", p: "AM" }
        const [h24, m] = val.split(':')
        const hNum = parseInt(h24)
        const period = hNum >= 12 ? "PM" : "AM"
        const h12 = hNum % 12 || 12
        return { h: h12.toString().padStart(2, '0'), m, p: period }
    }

    const initial = parseTime(value)
    const [hours, setHours] = useState(initial.h)
    const [minutes, setMinutes] = useState(initial.m)
    const [period, setPeriod] = useState<"AM" | "PM">(initial.p as "AM" | "PM")

    useEffect(() => {
        if (value) {
            const parsed = parseTime(value)
            setHours(parsed.h)
            setMinutes(parsed.m)
            setPeriod(parsed.p as "AM" | "PM")
        }
    }, [value])

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

    const handleConfirm = () => {
        let h24 = parseInt(hours)
        if (period === "PM" && h24 < 12) h24 += 12
        if (period === "AM" && h24 === 12) h24 = 0

        onChange(`${h24.toString().padStart(2, '0')}:${minutes}`)
        setIsOpen(false)
    }

    const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
    const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))

    const formatDisplay = () => {
        if (!value) return placeholder
        const { h, m, p } = parseTime(value)
        return `${h}:${m} ${p}`
    }

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 border border-border bg-background rounded-xl hover:border-primary/50 transition-all text-sm font-medium ${isOpen ? "ring-2 ring-primary/20 border-primary" : ""}`}
            >
                <Clock size={18} className={iconColor} />
                <span className={value ? "text-foreground font-mono" : "text-muted-foreground font-mono"}>
                    {formatDisplay()}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 p-3 bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[220px] bg-card">
                    <div className="flex gap-3 items-center justify-center p-0.5">
                        {/* Hours */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Hour</span>
                            <div className="flex flex-col h-28 overflow-y-auto no-scrollbar border border-border rounded-lg bg-muted/20 p-1">
                                {hourOptions.map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setHours(h)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${hours === h ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <span className="text-xl font-bold text-muted-foreground mt-4">:</span>

                        {/* Minutes */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Min</span>
                            <div className="flex flex-col h-28 overflow-y-auto no-scrollbar border border-border rounded-lg bg-muted/20 p-1">
                                {minuteOptions.map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMinutes(m)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${minutes === m ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AM/PM */}
                        <div className="flex flex-col items-center gap-1 ml-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pd</span>
                            <div className="flex flex-col gap-1 border border-border rounded-lg bg-muted/20 p-1">
                                {["AM", "PM"].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPeriod(p as "AM" | "PM")}
                                        className={`px-3 py-2 rounded-md text-xs font-bold transition-colors ${period === p ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
