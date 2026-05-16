"use client"

import { useEffect, useState, useCallback } from "react"
import { XIcon } from "lucide-react"

export function ExpandableImage({ src, alt }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, close])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-8 w-full cursor-zoom-in overflow-hidden rounded"
      >
        <img
          src={src}
          alt={alt ?? ""}
          referrerPolicy="no-referrer"
          className="max-h-72 w-full object-cover object-top transition-transform duration-300 hover:scale-[1.02]"
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-8"
        >
          <div className="absolute inset-0" onClick={close} />

          <button
            type="button"
            aria-label="Close image"
            onClick={close}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <XIcon className="size-5" />
          </button>

          <img
            src={src}
            alt={alt ?? ""}
            referrerPolicy="no-referrer"
            className="relative z-10 max-h-[85vh] max-w-[calc(100vw-2rem)] rounded object-contain sm:max-w-[85vw]"
            onClick={(e) => {
              e.stopPropagation()
              close()
            }}
          />
        </div>
      )}
    </>
  )
}
