import type { CalendarEvent } from "@/lib/types"

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  })
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const startStr = weekStart.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  })
  const endStr = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  })
  return `${startStr} – ${endStr}`
}

type GroupedEvents = [string, CalendarEvent[]][]

function groupByDay(events: CalendarEvent[]): GroupedEvents {
  const groups = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const key = formatDay(event.start)
    const group = groups.get(key)
    if (group) group.push(event)
    else groups.set(key, [event])
  }
  return Array.from(groups.entries())
}

export function generateWeeklyCaption(
  events: CalendarEvent[],
  weekStart: Date
): string {
  const weekRange = formatWeekRange(weekStart)
  const grouped = groupByDay(events)

  const lines: string[] = [`🏳️‍🌈 This Week in Queer Lowell`, `${weekRange}`, ""]

  for (const [day, dayEvents] of grouped) {
    lines.push(`📅 ${day}`)
    for (const event of dayEvents) {
      const time = event.isAllDay ? "All day" : formatTime(event.start)
      lines.push(`▸ ${event.title} — ${time}`)
      if (event.location) {
        lines.push(`  📍 ${event.location}`)
      }
    }
    lines.push("")
  }

  lines.push(
    `Full calendar + details at lowellisqueer.com 🔗`,
    "",
    "#lowell #queer #lgbtq #pride #community"
  )

  return lines.join("\n")
}
