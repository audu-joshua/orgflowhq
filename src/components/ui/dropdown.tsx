"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface DropdownItem {
  label: string
  value: string
  onClick?: () => void
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
}

export function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
        {trigger}
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                item.onClick?.()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm text-gray-700"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
