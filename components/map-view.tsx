"use client"

import { useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import { useTheme } from "next-themes"
import { formatDate, formatTime } from "@/lib/format"
import type { SerializedCalendarEvent } from "@/lib/types"

const MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
  <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="%23E53935"/>
  <circle cx="14" cy="13" r="5" fill="white"/>
</svg>`

const markerIcon = L.icon({
  iconUrl: `data:image/svg+xml,${MARKER_SVG}`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -34],
})

function createClusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount()
  const px = count >= 50 ? 48 : count >= 10 ? 40 : 34

  return L.divIcon({
    html: `<div style="
      width: ${px}px; height: ${px}px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: #E53935;
      color: white;
      font-weight: 700;
      font-size: ${count >= 50 ? 14 : 12}px;
      font-family: system-ui, sans-serif;
      box-shadow: 0 0 0 4px rgba(229, 57, 53, 0.25), 0 2px 8px rgba(0,0,0,0.15);
    ">${count}</div>`,
    className: "",
    iconSize: L.point(px, px),
  })
}

const TILES = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    labels: "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
}

const LOWELL_CENTER: L.LatLngExpression = [42.6334, -71.3162]
const MAX_POPUP_EVENTS = 5

type VenueGroup = {
  location: string
  lat: number
  lng: number
  events: SerializedCalendarEvent[]
}

export function MapView({ events }: { events: SerializedCalendarEvent[] }) {
  const { resolvedTheme } = useTheme()
  const tiles = resolvedTheme === "dark" ? TILES.dark : TILES.light

  const venues = useMemo(() => {
    const grouped = new Map<
      string,
      { events: SerializedCalendarEvent[]; lat: number; lng: number }
    >()
    for (const event of events) {
      if (!event.lat || !event.lng) continue
      const existing = grouped.get(event.location)
      if (existing) {
        existing.events.push(event)
      } else {
        grouped.set(event.location, {
          events: [event],
          lat: event.lat,
          lng: event.lng,
        })
      }
    }

    const result: VenueGroup[] = []
    for (const [location, { events: venueEvents, lat, lng }] of grouped) {
      result.push({ location, lat, lng, events: venueEvents })
    }
    return result
  }, [events])

  if (!venues.length) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center border-2 border-border">
        <p className="text-muted-foreground">
          No events with locations to display on the map
        </p>
      </div>
    )
  }

  return (
    <MapContainer
      center={LOWELL_CENTER}
      zoom={12}
      className="h-[600px] w-full overflow-hidden border-2 border-border"
    >
      <TileLayer url={tiles.url} attribution={tiles.attribution} />
      {"labels" in tiles && (
        <TileLayer
          url={(tiles as { labels: string }).labels}
          className="leaflet-labels-bright"
        />
      )}
      <MarkerClusterGroup iconCreateFunction={createClusterIcon}>
        {venues.map((venue) => (
          <Marker
            key={venue.location}
            position={[venue.lat, venue.lng]}
            icon={markerIcon}
          >
            <Popup>
              <VenuePopup venue={venue} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

type EventGroup = {
  title: string
  dates: { id: string; start: string; isAllDay: boolean }[]
}

function groupEventsByTitle(events: SerializedCalendarEvent[]): EventGroup[] {
  const grouped = new Map<string, EventGroup>()
  for (const event of events) {
    const existing = grouped.get(event.title)
    if (existing) {
      existing.dates.push({ id: event.id, start: event.start, isAllDay: event.isAllDay })
    } else {
      grouped.set(event.title, {
        title: event.title,
        dates: [{ id: event.id, start: event.start, isAllDay: event.isAllDay }],
      })
    }
  }
  return Array.from(grouped.values())
}

function VenuePopup({ venue }: { venue: VenueGroup }) {
  const groups = groupEventsByTitle(venue.events)
  const shown = groups.slice(0, MAX_POPUP_EVENTS)
  const remaining = groups.length - shown.length

  return (
    <div className="max-w-[240px] font-sans">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {venue.location}
      </p>
      <div className="space-y-2">
        {shown.map((group) => (
          <div
            key={group.title}
            className="border-t border-border pt-2 first:border-0 first:pt-0"
          >
            <a
              href={`/events/${group.dates[0].id}`}
              className="text-sm font-bold text-primary no-underline hover:underline"
            >
              {group.title}
            </a>
            <div className="mt-0.5 space-y-0.5">
              {group.dates.slice(0, 3).map((d) => (
                <p key={d.id} className="text-xs text-muted-foreground">
                  {formatDate(new Date(d.start))}
                  {" · "}
                  {d.isAllDay ? "All day" : formatTime(new Date(d.start))}
                </p>
              ))}
              {group.dates.length > 3 && (
                <p className="text-xs text-muted-foreground/70">
                  +{group.dates.length - 3} more date{group.dates.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground/70">
          +{remaining} more event{remaining > 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}

export default MapView
