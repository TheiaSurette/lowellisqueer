import { NextResponse } from "next/server"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import { fetchEvents } from "@/lib/google-calendar"
import { WeeklySlide } from "@/lib/image/weekly-slides"
import { loadAllFonts } from "@/lib/fonts"
import { formatWeekRange, TZ } from "@/lib/format"

const EVENTS_PER_SLIDE = 5
const WIDTH = 1080
const HEIGHT = 1350

function getMonSunBounds(now = new Date()): { start: Date; end: Date } {
  const et = new Date(now.toLocaleString("en-US", { timeZone: TZ }))
  const day = et.getDay()
  const monday = new Date(et)
  monday.setDate(et.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  return { start: monday, end: nextMonday }
}

let fontCache: Awaited<ReturnType<typeof loadAllFonts>> | null = null

export async function GET() {
  try {
    const { start, end } = getMonSunBounds()

    const events = await fetchEvents({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      maxResults: 50,
    })

    const weekRange = formatWeekRange(start)

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
