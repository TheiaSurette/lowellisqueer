import type { CalendarEvent } from "@/lib/types"

const HTML_BR_RE = /<br\s*\/?>/gi
const HTML_TAG_RE = /<[^>]*>/g

export const TZ = "America/New_York"

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: TZ,
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  })
}

export function formatMonthShort(date: Date): string {
  return date
    .toLocaleDateString("en-US", { month: "short", timeZone: TZ })
    .toUpperCase()
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: TZ,
  })
}

export function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", timeZone: TZ })
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", timeZone: TZ })
}

export function formatWeekdayUpper(date: Date): string {
  return date
    .toLocaleDateString("en-US", { weekday: "short", timeZone: TZ })
    .toUpperCase()
}

export function formatWeekdayLong(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", timeZone: TZ })
}

export function formatWeekdayLongUpper(date: Date): string {
  return date
    .toLocaleDateString("en-US", { weekday: "long", timeZone: TZ })
    .toUpperCase()
}

export function formatShortDate(date: Date): string {
  const month = formatMonthShort(date)
  const day = formatDay(date)
  return `${month} ${day}`
}

export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const startStr = weekStart.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: TZ,
  })
  const endStr = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: TZ,
  })
  return `${startStr} – ${endStr}`
}

export function groupByDay(
  events: CalendarEvent[]
): [string, CalendarEvent[]][] {
  const groups = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const key = formatDate(event.start)
    const group = groups.get(key)
    if (group) group.push(event)
    else groups.set(key, [event])
  }
  return Array.from(groups.entries())
}

export function getWeekBounds(date?: Date): { start: Date; end: Date } {
  const now = date ?? new Date()
  const et = new Date(now.toLocaleString("en-US", { timeZone: TZ }))
  const offset = now.getTime() - et.getTime()

  const startET = new Date(et)
  startET.setHours(0, 0, 0, 0)
  startET.setDate(startET.getDate() + 1)

  const endET = new Date(startET)
  endET.setDate(endET.getDate() + 7)

  return {
    start: new Date(startET.getTime() + offset),
    end: new Date(endET.getTime() + offset),
  }
}

export function stripHtml(html: string): string {
  return html.replace(HTML_TAG_RE, "")
}

export function stripHtmlPreserveBreaks(html: string): string {
  return html.replace(HTML_BR_RE, "\n").replace(HTML_TAG_RE, "").trim()
}
