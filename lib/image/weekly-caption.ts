import type { CalendarEvent } from "@/lib/types"
import { formatTime, formatWeekday, TZ } from "@/lib/format"

function simplifyLocation(location: string): string {
  let loc = location.replace(/,\s*USA$/i, "")
  loc = loc.replace(/,\s*[A-Z]{2}[,\s]+\d{5}(-\d{4})?$/, "")
  loc = loc.replace(/,\s*[A-Z]{2}$/, "")
  const parts = loc.split(/,\s*/)
  const streetIndex = parts.findIndex((p) => /^\d/.test(p.trim()))
  if (streetIndex > 0) {
    loc = parts.slice(streetIndex).join(", ")
  }
  return loc
}

function formatNumericDate(date: Date): string {
  const month = date.toLocaleDateString("en-US", {
    month: "numeric",
    timeZone: TZ,
  })
  const day = date.toLocaleDateString("en-US", {
    day: "numeric",
    timeZone: TZ,
  })
  return `${month}/${day}`
}

function formatCaptionWeekRange(weekStart: Date): string {
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
  return `${startStr} - ${endStr}`
}

const INSTAGRAM_CHAR_LIMIT = 2200
const FOOTER = "Full calendar on our website (link in the bio)"
const TRUNCATED_FOOTER =
  "...and more! Check our event calendar for more info!"
const HASHTAGS = "#lowell #queer #lgbtq #pride #community"

function formatEvent(event: CalendarEvent): string {
  const dayAbbrev = formatWeekday(event.start)
  const numDate = formatNumericDate(event.start)
  const time = event.isAllDay ? "All day" : formatTime(event.start)
  const lines = [
    `${dayAbbrev} ${numDate} @ ${time}`,
    event.title,
  ]
  if (event.location) {
    lines.push(simplifyLocation(event.location))
  }
  return lines.join("\n")
}

export function generateWeeklyCaption(
  events: CalendarEvent[],
  weekStart: Date
): string {
  const weekRange = formatCaptionWeekRange(weekStart)
  const header = `\u{1F3F3}\u{FE0F}\u{200D}\u{1F308} This Week in Queer Lowell\n${weekRange}`
  const eventBlocks = events.map(formatEvent)

  const fullCaption = [header, "", ...eventBlocks.join("\n\n").split("\n"), "", FOOTER, "", HASHTAGS].join("\n")

  if (fullCaption.length <= INSTAGRAM_CHAR_LIMIT) {
    return fullCaption
  }

  const suffix = `\n\n${TRUNCATED_FOOTER}\n\n${HASHTAGS}`
  let included = 0
  for (let i = eventBlocks.length; i > 0; i--) {
    const body = eventBlocks.slice(0, i).join("\n\n")
    const candidate = `${header}\n\n${body}\n${suffix}`
    if (candidate.length <= INSTAGRAM_CHAR_LIMIT) {
      included = i
      break
    }
  }

  const body = eventBlocks.slice(0, included).join("\n\n")
  return `${header}\n\n${body}\n${suffix}`
}
