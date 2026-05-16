import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import fs from "fs/promises"
import path from "path"
import type { CalendarEvent } from "../lib/types"
import { WeeklySlide } from "../lib/image/weekly-slides"
import { generateWeeklyCaption } from "../lib/image/weekly-caption"
import { extractImageUrl, extractInstagramUrl } from "../lib/google-calendar"
import { loadFont, FONT_URLS } from "../lib/fonts"

const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY ?? ""
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? ""
if (!API_KEY || !CALENDAR_ID) {
  throw new Error(
    "Missing GOOGLE_CALENDAR_API_KEY or GOOGLE_CALENDAR_ID env vars"
  )
}

const EVENTS_PER_SLIDE = 5
const WIDTH = 1080
const HEIGHT = 1350

type RawGoogleCalendarEvent = {
  id: string
  summary?: string
  description?: string
  location?: string
  colorId?: string
  htmlLink: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

type RawGoogleCalendarResponse = {
  items?: RawGoogleCalendarEvent[]
}

type EventWithRawDescription = CalendarEvent & { rawDescription: string }

async function fetchEvents(
  timeMin: string,
  timeMax: string
): Promise<EventWithRawDescription[]> {
  const params = new URLSearchParams({
    key: API_KEY,
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  })

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Calendar API: ${res.status}`)

  const data: RawGoogleCalendarResponse = await res.json()
  return (data.items ?? []).map((e) => {
    const desc = e.description ?? ""
    const tagMatch = desc.match(/#tags:\s*"([^"]*)"/i)
    const tags = tagMatch
      ? tagMatch[1]
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []
    return {
      id: e.id,
      title: e.summary ?? "(No title)",
      description: desc
        .replace(/#featured\s*/gi, "")
        .replace(/#image:\s*(?:<a[^>]*>)?https?:\/\/[^\s<]+(?:<\/a>)?\s*/gi, "")
        .replace(/#tags:\s*"[^"]*"\s*/gi, "")
        .trim(),
      rawDescription: desc,
      location: e.location ?? "",
      start: new Date(e.start.dateTime ?? e.start.date!),
      end: new Date(e.end.dateTime ?? e.end.date!),
      isAllDay: !e.start.dateTime,
      colorId: e.colorId ?? null,
      imageUrl: extractImageUrl(desc),
      featured: desc.includes("#featured"),
      tags,
      htmlLink: e.htmlLink,
    }
  })
}

async function main() {
  const { getWeekBounds } = await import("../lib/format")
  const { start, end } = getWeekBounds()

  console.log(
    `Fetching events for ${start.toDateString()} – ${end.toDateString()}...`
  )
  const events = await fetchEvents(start.toISOString(), end.toISOString())
  console.log(`Found ${events.length} event(s)`)

  if (events.length === 0) {
    console.log("No events — nothing to generate.")
    return
  }

  const chunks: CalendarEvent[][] = []
  for (let i = 0; i < events.length; i += EVENTS_PER_SLIDE) {
    chunks.push(events.slice(i, i + EVENTS_PER_SLIDE))
  }

  const [soraLight, sora, soraMedium, fraunces, frauncesBlack] =
    await Promise.all([
      loadFont(FONT_URLS.soraLight),
      loadFont(FONT_URLS.sora),
      loadFont(FONT_URLS.soraMedium),
      loadFont(FONT_URLS.fraunces),
      loadFont(FONT_URLS.frauncesBlack),
    ])

  const fonts = [
    {
      name: "Sora",
      data: soraLight,
      weight: 300 as const,
      style: "normal" as const,
    },
    {
      name: "Sora",
      data: sora,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Sora",
      data: soraMedium,
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "Fraunces",
      data: fraunces,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Fraunces",
      data: frauncesBlack,
      weight: 900 as const,
      style: "normal" as const,
    },
  ]

  const dateStr = start.toISOString().slice(0, 10)
  const outputDir = path.join(process.cwd(), "out", "slides", dateStr)
  await fs.mkdir(outputDir, { recursive: true })

  for (let i = 0; i < chunks.length; i++) {
    const svg = await satori(
      WeeklySlide({
        events: chunks[i],
        weekStart: start,
        slideIndex: i,
      }),
      { width: WIDTH, height: HEIGHT, fonts }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    const png = resvg.render().asPng()

    const filename = `slide-${i + 1}.png`
    const filePath = path.join(outputDir, filename)
    await fs.writeFile(filePath, png)

    console.log(`Generated slide ${i + 1}/${chunks.length}: ${filename}`)
  }

  const caption = generateWeeklyCaption(events, start)
  const captionPath = path.join(outputDir, "caption.txt")
  await fs.writeFile(captionPath, caption)

  // Collect event images
  const downloaded: { eventTitle: string; filename: string }[] = []
  const instagram: { eventTitle: string; url: string; filename: string }[] = []
  let imageIndex = 1

  for (const event of events) {
    const igUrl = extractInstagramUrl(event.rawDescription)

    if (event.imageUrl) {
      const filename = `event-image-${imageIndex}.png`
      try {
        const imgRes = await fetch(event.imageUrl)
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer())
          await fs.writeFile(path.join(outputDir, filename), buffer)
          downloaded.push({ eventTitle: event.title, filename })
          console.log(`Downloaded image for "${event.title}": ${filename}`)
          imageIndex++
        } else {
          console.warn(
            `Failed to download image for "${event.title}": ${imgRes.status}`
          )
        }
      } catch (err) {
        console.warn(
          `Failed to download image for "${event.title}": ${(err as Error).message}`
        )
      }
    } else if (igUrl) {
      const filename = `event-image-${imageIndex}.png`
      instagram.push({ eventTitle: event.title, url: igUrl, filename })
      imageIndex++
    }
  }

  const manifest = { downloaded, instagram }
  await fs.writeFile(
    path.join(outputDir, "event-images.json"),
    JSON.stringify(manifest, null, 2)
  )

  console.log(
    `\nDone! ${chunks.length} slide(s) + caption saved to ${outputDir}`
  )
  if (downloaded.length > 0)
    console.log(`Downloaded ${downloaded.length} event image(s)`)
  if (instagram.length > 0)
    console.log(
      `${instagram.length} Instagram image(s) pending browser extraction`
    )
  console.log("\n--- Caption ---\n")
  console.log(caption)
}

main().catch((err) => {
  console.error("Error:", err.message)
  process.exit(1)
})
