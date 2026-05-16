"use client"

import { useState, type ReactNode } from "react"
import { ListIcon, CalendarIcon } from "lucide-react"

const VIEW_OPTIONS = [
  { value: "schedule" as const, label: "Schedule", icon: ListIcon },
  { value: "calendar" as const, label: "Calendar", icon: CalendarIcon },
]

export function CalendarViewToggle({
  scheduleView,
  embedUrl,
}: {
  scheduleView: ReactNode
  embedUrl: string
}) {
  const [view, setView] = useState<"schedule" | "calendar">("schedule")

  return (
    <div>
      <div className="mb-8 flex gap-2">
        {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setView(value)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase transition-colors ${
              view === value
                ? "border-2 border-primary bg-primary text-primary-foreground"
                : "border-2 border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {view === "schedule" ? (
        scheduleView
      ) : (
        <div className="overflow-hidden border-2 border-border">
          <iframe
            src={embedUrl}
            className="h-[600px] w-full border-0"
            title="Google Calendar"
          />
        </div>
      )}
    </div>
  )
}
