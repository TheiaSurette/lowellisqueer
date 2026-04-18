import { Suspense } from "react"
import Link from "next/link"
import { cacheLife, cacheTag } from "next/cache"
import { fetchEvents, filterFeatured } from "@/lib/google-calendar"
import {
  formatDate,
  formatTime,
  formatMonthShort,
  formatDay,
  stripHtmlPreserveBreaks,
} from "@/lib/format"
import { spectrumColor, spectrumTextColor } from "@/lib/spectrum"
import {
  EventsSkeleton,
  UpcomingRowsSkeleton,
} from "@/components/events-skeleton"
import { HeroWordCycle } from "@/components/hero-word-cycle"
import type { CalendarEvent } from "@/lib/types"

function FeaturedCard({
  event,
  index,
  large,
}: {
  event: CalendarEvent
  index: number
  large?: boolean
}) {
  const color = spectrumColor(index)

  return (
    <a
      href={`/events/${event.id}`}
      className="group block border-l-[3px] px-6 py-5 transition-all hover:border-l-[6px] hover:bg-accent/60 hover:pl-[21px]"
      style={{ borderLeftColor: color }}
    >
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          className={`mb-4 w-full rounded object-cover object-top ${large ? "max-h-72" : "max-h-48"}`}
        />
      )}
      <h3
        className={`font-heading leading-tight font-bold ${large ? "text-[2rem]" : "text-xl"} mb-3`}
      >
        {event.title}
      </h3>
      <p className="mb-5 line-clamp-3 text-[0.95rem] leading-relaxed font-light whitespace-pre-line opacity-85">
        {stripHtmlPreserveBreaks(event.description)}
      </p>
      <div className="flex flex-wrap gap-5 text-xs font-normal text-muted-foreground">
        <span>{formatDate(event.start)}</span>
        <span>
          {formatTime(event.start)} &ndash; {formatTime(event.end)}
        </span>
        <span>{event.location}</span>
      </div>
    </a>
  )
}

function UpcomingRow({
  event,
  index,
}: {
  event: CalendarEvent
  index: number
}) {
  const color = spectrumTextColor(index)

  return (
    <a
      href={`/events/${event.id}`}
      className="group relative grid grid-cols-[80px_1fr_auto] items-center gap-8 border-b border-border py-4 transition-colors before:absolute before:top-0 before:bottom-0 before:left-0 before:w-0 before:transition-all before:duration-300 hover:bg-background/50 hover:before:w-[3px] max-sm:grid-cols-[60px_1fr] max-sm:gap-5"
      style={
        { "--row-color": color } as React.CSSProperties & {
          "--row-color": string
        }
      }
    >
      <div className="flex-shrink-0 pl-2 text-center">
        <span
          className="block text-[0.65rem] font-medium tracking-widest uppercase"
          style={{ color }}
        >
          {formatMonthShort(event.start)}
        </span>
        <span
          className="mt-0.5 block font-heading text-[1.8rem] leading-none font-bold"
          style={{ color }}
        >
          {formatDay(event.start)}
        </span>
      </div>
      <div>
        <h3 className="font-heading text-lg leading-snug font-bold">
          {event.title}
        </h3>
        <div className="mt-1 text-xs font-light text-muted-foreground">
          {formatTime(event.start)} &ndash; {formatTime(event.end)}
        </div>
      </div>
      <div className="pr-4 text-right text-sm font-light text-muted-foreground italic max-sm:col-span-full max-sm:pl-0 max-sm:text-left">
        {event.location}
      </div>
    </a>
  )
}

async function FeaturedEvents() {
  "use cache"
  cacheLife("minutes")
  cacheTag("featured-events")

  const events = await fetchEvents({ maxResults: 50 })
  const featured = filterFeatured(events).slice(0, 4)

  if (featured.length === 0) return null

  const first = featured[0]
  const rest = featured.slice(1)

  return (
    <section className="mx-auto max-w-[1100px] px-8 pb-14">
      <div className="mb-6 text-xs font-medium tracking-[0.2em] text-spectrum-red uppercase">
        Featured
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-8 max-md:grid-cols-1">
        <FeaturedCard event={first} index={0} large />
        <div className="flex flex-col gap-8">
          {rest.map((event, i) => (
            <FeaturedCard key={event.id} event={event} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

async function UpcomingEvents() {
  "use cache"
  cacheLife("minutes")
  cacheTag("events")

  const events = await fetchEvents({ maxResults: 6 })

  if (events.length === 0) {
    return (
      <section className="bg-secondary py-14">
        <div className="mx-auto max-w-[1100px] px-8">
          <div className="mb-6 text-xs font-medium tracking-[0.2em] text-spectrum-blue uppercase">
            Upcoming
          </div>
          <p className="text-muted-foreground">
            No upcoming events. Check back soon!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-secondary py-14">
      <div className="mx-auto max-w-[1100px] px-8">
        <div className="mb-6 text-xs font-medium tracking-[0.2em] text-spectrum-blue uppercase">
          Upcoming
        </div>
        <div className="flex flex-col">
          {events.map((event, i) => (
            <UpcomingRow key={event.id} event={event} index={i} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/calendar"
            className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            View all &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-[1100px] px-8 pt-12 pb-14">
        <h1 className="font-heading leading-[0.92] font-black tracking-tight">
          <span className="block text-[8vw] italic max-sm:text-[13vw]">
            Lowell Is
          </span>
          <span className="block min-h-[1.1em] text-[10vw] max-sm:text-[11vw]">
            <HeroWordCycle />
          </span>
        </h1>
        <p className="mt-5 max-w-[520px] text-xl leading-relaxed font-normal text-foreground/70">
          Celebrating LGBTQIA+ life, community, and culture in and around
          Lowell, Massachusetts.
        </p>
      </section>

      <Suspense fallback={<EventsSkeleton count={3} />}>
        <FeaturedEvents />
      </Suspense>

      <Suspense fallback={<UpcomingRowsSkeleton count={6} />}>
        <UpcomingEvents />
      </Suspense>
    </>
  )
}
