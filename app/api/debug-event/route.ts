import { NextResponse } from "next/server"
import { fetchEventById } from "@/lib/google-calendar"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get("id")

  if (!eventId) {
    return NextResponse.json({ error: "Missing id param" }, { status: 400 })
  }

  const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY
  const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

  const params = new URLSearchParams({ key: API_KEY ?? "" })
  const rawUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID ?? "")}/events/${encodeURIComponent(eventId)}?${params}`

  const rawResponse = await fetch(rawUrl)
  const rawStatus = rawResponse.status
  const rawBody = await rawResponse.text()

  const event = await fetchEventById(eventId)

  return NextResponse.json({
    hasApiKey: !!API_KEY,
    hasCalendarId: !!CALENDAR_ID,
    rawApiStatus: rawStatus,
    rawApiBody: rawBody.slice(0, 500),
    fetchEventByIdResult: event ? { id: event.id, title: event.title } : null,
  })
}
