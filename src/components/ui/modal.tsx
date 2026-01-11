"use client"

import React from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
  showCloseButton?: boolean
  closeOnOutsideClick?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  showCloseButton = true,
  closeOnOutsideClick = true
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  // Use createPortal to break out of parent stacking contexts (e.g. Layout, Sidebar)
  // ensuring the modal covers the entire screen/viewport.
  return typeof document !== "undefined"
    ? require("react-dom").createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] transition-all p-4">
        <div
          className={`bg-card rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ${maxWidth} w-full max-h-[90vh] flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in duration-300 relative`}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card/50 backdrop-blur-xl shrink-0">
              <h2 className="text-xl font-bold text-foreground truncate mr-4 tracking-tight">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-all p-2 hover:bg-muted rounded-xl flex-shrink-0 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            {children}
          </div>
        </div>
        {/* Click outside to close */}
        <button
          className={`absolute inset-0 -z-10 w-full h-full border-none bg-transparent cursor-default focus:outline-none`}
          onClick={closeOnOutsideClick ? onClose : undefined}
          aria-hidden="true"
        />
      </div>,
      document.body
    )
    : null
}
