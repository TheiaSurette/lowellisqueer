import { Resend } from "resend"
import { fetchEvents } from "@/lib/google-calendar"
import { getWeekBounds, formatWeekRange } from "@/lib/format"
import { WeeklyDigestEmail } from "./weekly-digest"

type SendDigestOptions = {
  weekOf?: Date
  testAddress?: string
}

type SendDigestResult = {
  broadcastId?: string
  emailId?: string
  eventCount: number
}

export async function sendWeeklyDigest(
  options?: SendDigestOptions
): Promise<SendDigestResult> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const audienceId = process.env.RESEND_AUDIENCE_ID
  const fromAddress = process.env.RESEND_FROM_ADDRESS
  const siteUrl = process.env.SITE_URL ?? "https://lowellisqueer.com"

  if (!fromAddress) {
    throw new Error("Missing RESEND_FROM_ADDRESS")
  }

  if (!options?.testAddress && !audienceId) {
    throw new Error("Missing RESEND_AUDIENCE_ID (required for broadcast)")
  }

  const { start, end } = getWeekBounds(options?.weekOf ?? new Date())

  const events = await fetchEvents({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 50,
  })

  const weekLabel = formatWeekRange(start)

  const subject =
    events.length > 0
      ? `This week in queer Lowell — ${weekLabel}`
      : `Lowell Is Queer — ${weekLabel}`

  const emailElement = WeeklyDigestEmail({ events, weekStart: start, siteUrl })

  if (options?.testAddress) {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: options.testAddress,
      subject: `[TEST] ${subject}`,
      react: emailElement,
    })

    if (error) {
      throw new Error(`Failed to send test email: ${error.message}`)
    }

    return { emailId: data?.id, eventCount: events.length }
  }

  const { data, error } = await resend.broadcasts.create({
    audienceId: audienceId!,
    from: fromAddress,
    subject,
    react: emailElement,
    name: `Weekly Digest — ${weekLabel}`,
    send: true,
  })

  if (error) {
    throw new Error(`Failed to send weekly digest: ${error.message}`)
  }

  return { broadcastId: data?.id, eventCount: events.length }
}
