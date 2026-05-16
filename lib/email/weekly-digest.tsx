import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { CalendarEvent } from "@/lib/types"
import { SPECTRUM, spectrumTextColor } from "@/lib/spectrum"
import {
  formatShortDate,
  formatTime,
  formatWeekdayLongUpper,
  formatWeekRange,
  groupByDay,
} from "@/lib/format"

const colors = {
  bg: "#FCFAF7",
  foreground: "#1C1917",
  muted: "#A8A29E",
  border: "#E7E2DD",
  primary: "#E53935",
}

export function WeeklyDigestEmail({
  events,
  weekStart,
  siteUrl,
}: {
  events: CalendarEvent[]
  weekStart: Date
  siteUrl: string
}) {
  const weekRange = formatWeekRange(weekStart)
  const grouped = groupByDay(events)
  let eventIndex = 0

  return (
    <Html>
      <Head />
      <Preview>{`${events.length} event${events.length !== 1 ? "s" : ""} this week`}</Preview>
      <Body
        style={{
          backgroundColor: colors.bg,
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}
        >
          {/* Header */}
          <Section
            style={{ textAlign: "center" as const, marginBottom: "32px" }}
          >
            <Text
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: colors.muted,
                margin: "0 0 8px",
              }}
            >
              Weekly Digest
            </Text>
            <Heading
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: colors.foreground,
                margin: "0 0 6px",
                lineHeight: "1.1",
              }}
            >
              Lowell Is Queer
            </Heading>
            {/* Spectrum bar */}
            <Section style={{ margin: "16px auto 0", width: "180px" }}>
              <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
                <tr>
                  {SPECTRUM.map((c) => (
                    <td
                      key={c}
                      style={{
                        height: "3px",
                        backgroundColor: c,
                        width: `${100 / SPECTRUM.length}%`,
                      }}
                    />
                  ))}
                </tr>
              </table>
            </Section>
          </Section>

          {/* Week range */}
          <Text
            style={{
              fontSize: "14px",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.15em",
              color: colors.primary,
              margin: "0 0 4px",
            }}
          >
            {weekRange}
          </Text>

          {/* Event count */}
          <Text
            style={{
              fontSize: "13px",
              color: colors.muted,
              margin: "0 0 28px",
            }}
          >
            {events.length} event{events.length !== 1 ? "s" : ""} this week
          </Text>

          {events.length === 0 ? (
            <Text
              style={{
                fontSize: "15px",
                color: colors.muted,
                lineHeight: "1.6",
              }}
            >
              No events scheduled this week. Check back soon!
            </Text>
          ) : (
            grouped.map(([day, dayEvents]) => {
              const dayStartIndex = eventIndex
              const sampleEvent = dayEvents[0]
              const accent = spectrumTextColor(dayStartIndex)

              return (
                <Section key={day} style={{ marginBottom: "28px" }}>
                  {/* Day header */}
                  <Text
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      color: accent,
                      margin: "0 0 2px",
                    }}
                  >
                    {formatShortDate(sampleEvent.start)} —{" "}
                    {formatWeekdayLongUpper(sampleEvent.start)}
                  </Text>
                  <Hr
                    style={{
                      borderTop: `2px solid ${accent}`,
                      opacity: 0.3,
                      margin: "0 0 14px",
                    }}
                  />

                  {dayEvents.map((event) => {
                    const eventAccent = spectrumTextColor(eventIndex)
                    eventIndex++
                    return (
                      <Section
                        key={event.id}
                        style={{
                          borderLeft: `3px solid ${eventAccent}`,
                          paddingLeft: "16px",
                          marginBottom: "16px",
                        }}
                      >
                        <Link
                          href={`${siteUrl}/events/${event.id}`}
                          style={{
                            fontSize: "17px",
                            fontWeight: 700,
                            color: colors.foreground,
                            textDecoration: "none",
                            lineHeight: "1.3",
                          }}
                        >
                          {event.title}
                        </Link>
                        <Text
                          style={{
                            fontSize: "13px",
                            color: colors.muted,
                            margin: "4px 0 0",
                            lineHeight: "1.5",
                          }}
                        >
                          {event.isAllDay
                            ? "All day"
                            : `${formatTime(event.start)} – ${formatTime(event.end)}`}
                          {event.location ? ` · ${event.location}` : ""}
                        </Text>
                        {event.tags.length > 0 && (
                          <Text
                            style={{ margin: "6px 0 0", lineHeight: "1.8" }}
                          >
                            {event.tags.map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  display: "inline-block",
                                  fontSize: "11px",
                                  fontWeight: 500,
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase" as const,
                                  color: colors.muted,
                                  border: `1px solid ${colors.border}`,
                                  padding: "2px 8px",
                                  marginRight: "4px",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </Text>
                        )}
                      </Section>
                    )
                  })}
                </Section>
              )
            })
          )}

          <Hr
            style={{
              borderTop: `2px solid ${colors.border}`,
              margin: "32px 0",
            }}
          />

          {/* Footer */}
          <Section style={{ textAlign: "center" as const }}>
            <Link
              href={siteUrl}
              style={{
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                color: colors.primary,
                textDecoration: "none",
              }}
            >
              View Full Calendar →
            </Link>
            <Text
              style={{
                fontSize: "11px",
                color: colors.muted,
                margin: "16px 0 0",
                lineHeight: "1.5",
              }}
            >
              You&apos;re receiving this because you subscribed to the Lowell Is
              Queer newsletter. Please do not reply to this email.{" "}
              <Link
                href="{{{ unsubscribe_url }}}"
                style={{ color: colors.muted, textDecoration: "underline" }}
              >
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
