"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react"
import {
  formatDate,
  formatTime,
  TZ,
  stripHtmlPreserveBreaks,
} from "@/lib/format"
import { spectrumColor, SPECTRUM } from "@/lib/spectrum"
import type { PrideSpotlight, SerializedCalendarEvent } from "@/lib/types"
import { INTERNAL_TAGS } from "@/lib/tags"

type EventRowData = {
  title: string
  events: SerializedCalendarEvent[]
  accentColor: string
}

const RAINBOW_GRADIENT = `linear-gradient(135deg, ${SPECTRUM.join(", ")})`

function categorizeEvents(events: SerializedCalendarEvent[]): EventRowData[] {
  const rows: EventRowData[] = []

  const now = new Date()
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: TZ }))
  const offset = now.getTime() - eastern.getTime()
  const dayOfWeek = eastern.getDay()
  const weekStart = new Date(eastern)
  weekStart.setDate(eastern.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  const weekStartUTC = new Date(weekStart.getTime() + offset)
  const weekEndUTC = new Date(weekEnd.getTime() + offset)

  const thisWeek = events.filter((e) => {
    const start = new Date(e.start)
    return start >= weekStartUTC && start < weekEndUTC
  })
  rows.push({ title: "This Week", events: thisWeek, accentColor: SPECTRUM[0] })

  const excludedTags = new Set([...INTERNAL_TAGS, "Pride"])

  const tagBuckets = new Map<string, SerializedCalendarEvent[]>()
  for (const event of events) {
    const visibleTags = event.tags.filter((t) => !excludedTags.has(t))
    for (const tag of visibleTags) {
      const bucket = tagBuckets.get(tag) ?? []
      bucket.push(event)
      tagBuckets.set(tag, bucket)
    }
  }

  let colorIdx = 1
  for (const [tag, tagEvents] of tagBuckets) {
    rows.push({
      title: tag,
      events: tagEvents,
      accentColor: SPECTRUM[colorIdx % SPECTRUM.length],
    })
    colorIdx++
  }

  rows.push({
    title: "All Events",
    events,
    accentColor: SPECTRUM[3],
  })

  return rows
}

function PrideHero({ events }: { events: SerializedCalendarEvent[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (events.length <= 1 || paused) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % events.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [events.length, paused])

  return (
    <section
      className="relative min-h-[70vh] overflow-hidden sm:min-h-[70vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {events.map((event, i) => {
        const start = new Date(event.start)
        const end = new Date(event.end)
        const isActive = i === activeIndex

        return (
          <div
            key={event.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "" : "pointer-events-none"}`}
            style={{ opacity: isActive ? 1 : 0 }}
            aria-hidden={!isActive}
          >
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: RAINBOW_GRADIENT }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent" />
            <div className="relative flex h-full min-h-[70vh] items-end">
              <div
                className="w-full px-6 pb-28 sm:px-12 sm:pb-32 lg:max-w-4xl lg:px-24 xl:px-32"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
              >
                <h2 className="font-heading text-3xl leading-tight font-black text-white sm:text-5xl lg:text-6xl">
                  {event.title}
                </h2>
                {event.description && (
                  <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-relaxed text-white/95 sm:text-base">
                    {stripHtmlPreserveBreaks(event.description)}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="size-4" />
                    {formatDate(start)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="size-4" />
                    {event.isAllDay
                      ? "All day"
                      : `${formatTime(start)} – ${formatTime(end)}`}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPinIcon className="size-4" />
                      {event.location}
                    </span>
                  )}
                </div>
                <a
                  href={`/events/${event.id}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-sm border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  View Details
                  <ChevronRightIcon className="size-4" />
                </a>
              </div>
            </div>
          </div>
        )
      })}
      {events.length > 1 && (
        <div className="absolute bottom-8 left-6 z-10 flex gap-2 sm:left-12">
          {events.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className="size-2.5 rounded-full transition-all duration-300"
              style={{
                background:
                  i === activeIndex
                    ? SPECTRUM[i % SPECTRUM.length]
                    : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function EventCard({
  event,
  index,
}: {
  event: SerializedCalendarEvent
  index: number
}) {
  const color = spectrumColor(index)
  const start = new Date(event.start)

  return (
    <a
      href={`/events/${event.id}`}
      className="group/card relative w-[180px] flex-shrink-0 snap-start rounded-md transition-all duration-300 hover:z-10 hover:scale-105 hover:shadow-xl hover:shadow-black/20 sm:w-[240px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-md">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}99)`,
            }}
          >
            <CalendarIcon className="size-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div
          className="absolute inset-x-0 bottom-0 p-4"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
        >
          <h4 className="text-sm leading-tight font-bold text-white sm:text-base">
            {event.title}
          </h4>
          <p className="mt-1 text-xs text-white/70">{formatDate(start)}</p>
          {event.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/60">
              <MapPinIcon className="size-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </p>
          )}
        </div>
      </div>
      <div className="h-0.5" style={{ background: color }} />
    </a>
  )
}

function EventRow({
  title,
  events,
  accentColor,
}: {
  title: string
  events: SerializedCalendarEvent[]
  accentColor: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateScrollState, { passive: true })
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => {
      el.removeEventListener("scroll", updateScrollState)
      observer.disconnect()
    }
  }, [updateScrollState])

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  return (
    <div className="group/row relative">
      <h3
        className="mb-3 px-6 font-heading text-base font-bold sm:px-12 sm:text-lg"
        style={{ color: accentColor }}
      >
        {title}
      </h3>
      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="absolute top-0 bottom-0 left-0 z-10 flex w-10 items-center justify-center bg-gradient-to-r from-[var(--background)] to-transparent opacity-0 transition-opacity group-hover/row:opacity-100 max-sm:hidden sm:w-14"
          >
            <ChevronLeftIcon className="size-6 text-foreground" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="-my-4 scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-6 py-4 sm:gap-4 sm:px-12"
        >
          {events.length > 0 ? (
            events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))
          ) : (
            <p className="py-8 text-sm text-muted-foreground">
              No events this week. Check back soon!
            </p>
          )}
        </div>
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="absolute top-0 right-0 bottom-0 z-10 flex w-10 items-center justify-center bg-gradient-to-l from-[var(--background)] to-transparent opacity-0 transition-opacity group-hover/row:opacity-100 max-sm:hidden sm:w-14"
          >
            <ChevronRightIcon className="size-6 text-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}

function SpotlightCard({
  spotlight,
  index,
}: {
  spotlight: PrideSpotlight
  index: number
}) {
  const color = spectrumColor(index)

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="w-[220px] flex-shrink-0 cursor-pointer snap-start rounded-lg border border-border/50 bg-card p-5 text-left transition-all duration-300 hover:scale-105 hover:shadow-lg sm:w-[280px]"
        style={{ borderTopWidth: 3, borderTopColor: color }}
        nativeButton={false}
        render={<div role="button" tabIndex={0} />}
      >
        <h4 className="font-heading text-base leading-tight font-bold sm:text-lg">
          {spotlight.name}
        </h4>
        {spotlight.location && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPinIcon className="size-3 flex-shrink-0" />
            {spotlight.location}
          </p>
        )}
        {spotlight.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed font-light text-foreground/70">
            {spotlight.description}
          </p>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-border bg-background p-6 pt-10 shadow-lg transition-all data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="h-1 rounded-full" style={{ background: color }} />
          <Dialog.Title className="mt-4 font-heading text-xl font-bold">
            {spotlight.name}
          </Dialog.Title>
          {spotlight.location && (
            <div className="mt-3 flex items-center gap-2 text-sm font-light text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" />
              {spotlight.location}
            </div>
          )}
          {spotlight.description && (
            <p className="mt-4 text-sm leading-relaxed font-light text-muted-foreground">
              {spotlight.description}
            </p>
          )}
          {spotlight.website && (
            <a
              href={spotlight.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border-2 border-primary bg-primary px-5 py-2.5 text-xs font-medium tracking-wider text-primary-foreground uppercase transition-colors hover:bg-primary/90"
            >
              <ExternalLinkIcon className="size-3.5" />
              Visit Website
            </a>
          )}
          <Dialog.Close
            aria-label="Close"
            className="absolute top-4 right-4 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon className="size-4" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-6 font-heading text-3xl font-black tracking-tight sm:px-12 sm:text-4xl">
      {children}
    </h3>
  )
}

export function PrideGallery({
  events,
  heroEvents,
  spotlights,
}: {
  events: SerializedCalendarEvent[]
  heroEvents: SerializedCalendarEvent[]
  spotlights: PrideSpotlight[]
}) {
  const rows = useMemo(() => categorizeEvents(events), [events])

  const rainbowText: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${SPECTRUM.join(", ")})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }

  return (
    <div>
      {heroEvents.length > 0 && <PrideHero events={heroEvents} />}

      <div className="mx-auto max-w-[1300px] py-10 sm:py-14">
        <div className="mb-10 px-6 sm:mb-14 sm:px-12">
          <h1 className="font-heading text-5xl font-black tracking-tight sm:text-6xl">
            Lowell Is Queer{" "}
            <span
              style={{
                ...rainbowText,
                filter: "drop-shadow(-1px 2px 0 rgba(0,0,0,1))",
              }}
            >
              Pride Guide
            </span>
          </h1>
        </div>

        <SectionHeader>Events</SectionHeader>
        <div className="mt-6 space-y-10 sm:mt-8 sm:space-y-14">
          {rows.map((row) => (
            <EventRow
              key={row.title}
              title={row.title}
              events={row.events}
              accentColor={row.accentColor}
            />
          ))}
        </div>

        {spotlights.length > 0 && (
          <div className="mt-14 sm:mt-20">
            <SectionHeader>Also Check Out</SectionHeader>
            <div className="-my-4 mt-6 scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-6 py-4 sm:gap-4 sm:px-12">
              {spotlights.map((spotlight, i) => (
                <SpotlightCard
                  key={spotlight.name}
                  spotlight={spotlight}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function PrideGallerySkeleton() {
  return (
    <div>
      <div className="min-h-[50vh] animate-pulse bg-muted/30 sm:min-h-[70vh]" />
      {Array.from({ length: 2 }).map((_, rowIdx) => (
        <div key={rowIdx} className="mt-10 sm:mt-14">
          <div className="mb-3 px-6 sm:px-12">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="scrollbar-hide flex gap-3 overflow-hidden px-6 sm:gap-4 sm:px-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-[180px] flex-shrink-0 animate-pulse rounded-md bg-muted/50 sm:w-[240px]"
                style={{ aspectRatio: "2/3" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
