"use client"

import { useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { MenuIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { SPECTRUM } from "@/lib/spectrum"

const NAV_LINKS = [
  { href: "/pride", label: "Pride" },
  { href: "/about", label: "About" },
  { href: "/calendar", label: "Calendar" },
  { href: "/submit", label: "Submit" },
  { href: "/resources", label: "Resources" },
  { href: "/meetups", label: "Meetups" },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground sm:hidden"
      >
        <MenuIcon className="size-6" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-0 right-0 left-0 z-50 border-b-2 border-primary bg-background px-8 pt-8 pb-8 shadow-lg transition-all data-[ending-style]:-translate-y-full data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-full data-[starting-style]:opacity-0">
          <div className="mb-8 flex items-center justify-between">
            <span className="font-heading text-lg font-black tracking-wider">
              Menu
            </span>
            <Dialog.Close
              aria-label="Close menu"
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon className="size-6" />
            </Dialog.Close>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 py-3 text-sm tracking-[0.18em] uppercase transition-colors ${
                  link.href === "/pride"
                    ? "pride-shimmer font-bold"
                    : "font-normal text-muted-foreground hover:text-primary"
                }`}
                style={
                  link.href === "/pride"
                    ? {
                        backgroundImage: `linear-gradient(90deg, ${[...SPECTRUM, SPECTRUM[0]].join(", ")})`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }
                    : undefined
                }
              >
                <span
                  className="size-[6px] shrink-0 rounded-full"
                  style={{ background: SPECTRUM[i % SPECTRUM.length] }}
                />
                {link.label}
              </Link>
            ))}
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
