import type { CalendarEvent } from "@/lib/types"
import { formatTime, formatWeekdayLong, formatWeekRange } from "@/lib/format"

function groupByWeekday(events: CalendarEvent[]): [string, CalendarEvent[]][] {
  const groups = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const key = formatWeekdayLong(event.start)
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
  const grouped = groupByWeekday(events)

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
