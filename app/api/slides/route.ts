import { type NextRequest, NextResponse } from "next/server"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import { fetchEvents } from "@/lib/google-calendar"
import { WeeklySlide } from "@/lib/image/weekly-slides"
import { loadAllFonts } from "@/lib/fonts"
import { formatDateRange, TZ } from "@/lib/format"

const EVENTS_PER_SLIDE = 5
const WIDTH = 1080
const HEIGHT = 1350

function getSunSatBounds(now = new Date()): { start: Date; end: Date } {
  const et = new Date(now.toLocaleString("en-US", { timeZone: TZ }))
  const offset = now.getTime() - et.getTime()
  const day = et.getDay()
  const sunday = new Date(et)
  sunday.setDate(et.getDate() - day)
  sunday.setHours(0, 0, 0, 0)
  const nextSunday = new Date(sunday)
  nextSunday.setDate(sunday.getDate() + 7)
  return {
    start: new Date(sunday.getTime() + offset),
    end: new Date(nextSunday.getTime() + offset),
  }
}

function parseDateBounds(startStr: string, endStr: string): { start: Date; end: Date } {
  const now = new Date()
  const et = new Date(now.toLocaleString("en-US", { timeZone: TZ }))
  const offset = now.getTime() - et.getTime()
  const [sy, sm, sd] = startStr.split("-").map(Number)
  const startLocal = new Date(sy, sm - 1, sd, 0, 0, 0, 0)
  const [ey, em, ed] = endStr.split("-").map(Number)
  const endLocal = new Date(ey, em - 1, ed + 1, 0, 0, 0, 0)
  return {
    start: new Date(startLocal.getTime() + offset),
    end: new Date(endLocal.getTime() + offset),
  }
}

let fontCache: Awaited<ReturnType<typeof loadAllFonts>> | null = null

export async function GET(request: NextRequest) {
  try {
    const startParam = request.nextUrl.searchParams.get("start")
    const endParam = request.nextUrl.searchParams.get("end")

    const { start, end } = startParam && endParam
      ? parseDateBounds(startParam, endParam)
      : getSunSatBounds()

    const events = await fetchEvents({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      maxResults: 50,
    })

    const lastDay = new Date(end)
    lastDay.setDate(lastDay.getDate() - 1)
    const weekRange = formatDateRange(start, lastDay)
    const weekDate = start.toISOString().slice(0, 10)

    if (events.length === 0) {
      return NextResponse.json(
        { slides: [], weekRange, weekDate },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    const fonts = fontCache ?? (fontCache = await loadAllFonts())

    const chunks: (typeof events)[] = []
    for (let i = 0; i < events.length; i += EVENTS_PER_SLIDE) {
      chunks.push(events.slice(i, i + EVENTS_PER_SLIDE))
    }

    const slides: string[] = []

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
      slides.push(Buffer.from(png).toString("base64"))
    }

    return NextResponse.json(
      { slides, weekRange, weekDate },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("Slide generation failed:", error)
    return NextResponse.json(
      { error: "Failed to generate slides" },
      { status: 500 }
    )
  }
}
