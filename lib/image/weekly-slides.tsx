import type { CalendarEvent } from "@/lib/types"
import { INTERNAL_TAGS } from "@/lib/tags"
import { SPECTRUM } from "@/lib/spectrum"
import {
  formatDay,
  formatMonthShort,
  formatTime,
  formatWeekdayUpper,
  formatWeekRange,
} from "@/lib/format"

const colors = {
  bg: "#FCFAF7",
  foreground: "#1C1917",
  muted: "#78716C",
  border: "#E7E2DD",
  primary: "#E53935",
}

export function WeeklySlide({
  events,
  weekStart,
  slideIndex,
}: {
  events: CalendarEvent[]
  weekStart: Date
  slideIndex: number
}) {
  const weekRange = formatWeekRange(weekStart)

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.bg,
        padding: "60px 56px",
        fontFamily: "Sora",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.2em",
            color: colors.muted,
            textTransform: "uppercase" as const,
          }}
        >
          This Week
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 900,
            color: colors.foreground,
            fontFamily: "Fraunces",
            marginTop: 4,
          }}
        >
          Lowell Is Queer
        </div>

        {/* Spectrum bar */}
        <div style={{ display: "flex", width: 240, height: 4, marginTop: 20 }}>
          {SPECTRUM.map((c) => (
            <div key={c} style={{ flex: 1, backgroundColor: c, height: 4 }} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.12em",
            color: colors.primary,
            textTransform: "uppercase" as const,
            marginTop: 20,
          }}
        >
          {weekRange}
        </div>
      </div>

      {/* Events */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 0,
          marginTop: 16,
        }}
      >
        {events.map((event, i) => {
          const accent = SPECTRUM[(slideIndex * 5 + i) % SPECTRUM.length]
          return (
            <div
              key={event.id}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                borderBottom: `2px solid ${colors.border}`,
                padding: "28px 0",
                gap: 24,
              }}
            >
              {/* Date badge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 80,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: "0.15em",
                    color: accent,
                  }}
                >
                  {formatMonthShort(event.start)}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 44,
                    fontWeight: 700,
                    color: accent,
                    fontFamily: "Fraunces",
                    lineHeight: 1,
                    marginTop: 2,
                  }}
                >
                  {formatDay(event.start)}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    color: accent,
                  }}
                >
                  {formatWeekdayUpper(event.start)}
                </div>
              </div>

              {/* Event details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 27,
                    fontWeight: 500,
                    color: colors.foreground,
                    fontFamily: "Sora",
                    lineHeight: 1.2,
                  }}
                >
                  {event.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 17,
                    fontWeight: 300,
                    color: colors.muted,
                    marginTop: 8,
                  }}
                >
                  {event.isAllDay
                    ? "All day"
                    : `${formatTime(event.start)} – ${formatTime(event.end)}`}
                </div>
                {event.location && (
                  <div
                    style={{
                      display: "flex",
                      fontSize: 17,
                      fontWeight: 300,
                      color: colors.muted,
                      fontStyle: "italic",
                      marginTop: 4,
                    }}
                  >
                    {event.location}
                  </div>
                )}
                {event.tags.filter((t) => !INTERNAL_TAGS.has(t)).length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 6,
                      marginTop: 8,
                    }}
                  >
                    {event.tags.filter((t) => !INTERNAL_TAGS.has(t)).map((tag) => (
                      <div
                        key={tag}
                        style={{
                          display: "flex",
                          fontSize: 12,
                          fontWeight: 500,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase" as const,
                          color: colors.muted,
                          border: `1.5px solid ${colors.border}`,
                          padding: "3px 8px",
                        }}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: 15,
            fontWeight: 400,
            letterSpacing: "0.15em",
            color: colors.muted,
            textTransform: "uppercase" as const,
          }}
        >
          lowellisqueer.com
        </div>
      </div>
    </div>
  )
}
