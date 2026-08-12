"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MapPinIcon, NavigationIcon, XIcon, LoaderIcon } from "lucide-react"
import { useUserLocation } from "@/lib/geocode"
import type { Coordinates } from "@/lib/geocode"

export type DistanceFilterState = {
  center: { lat: number; lng: number }
  radiusMiles: number
  label: string
}

type Suggestion = { label: string; placeId: string }

const RADIUS_OPTIONS = [1, 2, 5, 10, 15, 25, 50, 100] as const

function useSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()

    if (query.trim().length < 2) {
      setSuggestions([]) // eslint-disable-line react-hooks/set-state-in-effect -- reset on input clear
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    abortRef.current = controller

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        )
        if (res.ok) {
          const data: Suggestion[] = await res.json()
          setSuggestions(data)
        }
      } catch {
        // aborted or network error
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return { suggestions, loading, clear: () => setSuggestions([]) }
}

export function DistanceFilter({
  onFilterChange,
}: {
  onFilterChange: (filter: DistanceFilterState | null) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [locationInput, setLocationInput] = useState("")
  const [center, setCenter] = useState<Coordinates | null>(null)
  const [radius, setRadius] = useState(10)
  const [label, setLabel] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const userLocation = useUserLocation()
  const { suggestions, loading: suggestionsLoading, clear: clearSuggestions } =
    useSuggestions(showSuggestions ? locationInput : "")

  const applyFilter = useCallback(
    (coords: Coordinates, r: number, l: string) => {
      onFilterChange({ center: coords, radiusMiles: r, label: l })
    },
    [onFilterChange],
  )

  const clearFilter = useCallback(() => {
    setCenter(null)
    setLabel("")
    setLocationInput("")
    setError(null)
    clearSuggestions()
    setShowSuggestions(false)
    onFilterChange(null)
  }, [onFilterChange, clearSuggestions])

  async function selectSuggestion(s: Suggestion) {
    const shortLabel =
      s.label.split(",").slice(0, 2).join(",").trim() || s.label
    setLocationInput(shortLabel)
    setShowSuggestions(false)
    clearSuggestions()
    setHighlightedIndex(-1)

    const res = await fetch(`/api/geocode?place_id=${encodeURIComponent(s.placeId)}`)
    if (!res.ok) {
      setError("Failed to resolve location")
      return
    }
    const coords: Coordinates | null = await res.json()
    if (!coords) {
      setError("Location not found")
      return
    }

    setCenter(coords)
    setLabel(shortLabel)
    applyFilter(coords, radius, shortLabel)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || !suggestions.length) {
      if (e.key === "Enter" && locationInput.trim()) {
        setShowSuggestions(true)
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((i) =>
        i < suggestions.length - 1 ? i + 1 : 0,
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((i) =>
        i > 0 ? i - 1 : suggestions.length - 1,
      )
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[highlightedIndex])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (userLocation.location && userLocation.loading === false) {
      setCenter(userLocation.location) // eslint-disable-line react-hooks/set-state-in-effect -- sync from geolocation hook
      setLabel("Current Location")
      applyFilter(userLocation.location, radius, "Current Location")
    }
  }, [userLocation.location, userLocation.loading, radius, applyFilter])

  useEffect(() => {
    if (userLocation.error) {
      setError(userLocation.error) // eslint-disable-line react-hooks/set-state-in-effect -- sync from geolocation hook
    }
  }, [userLocation.error])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 3000)
    return () => clearTimeout(timer)
  }, [error])

  function handleRadiusChange(r: number) {
    setRadius(r)
    if (center) {
      applyFilter(center, r, label)
    }
  }

  function handleToggle() {
    if (expanded) {
      clearFilter()
      setExpanded(false)
    } else {
      setExpanded(true)
    }
  }

  const isActive = center !== null

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 border-2 px-3 py-1 text-xs font-medium tracking-wider uppercase transition-colors ${
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
        }`}
      >
        <MapPinIcon className="size-3" />
        Filter by Distance
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <div ref={wrapperRef} className="relative flex-1">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value)
                  setShowSuggestions(true)
                  setHighlightedIndex(-1)
                }}
                onFocus={() => {
                  if (locationInput.trim().length >= 2) {
                    setShowSuggestions(true)
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="City, address, or zip code..."
                className="w-full border-2 border-border bg-transparent py-2 px-3 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
              {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto border-2 border-border bg-background shadow-lg">
                  {suggestionsLoading && suggestions.length === 0 && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">
                      Searching...
                    </li>
                  )}
                  {suggestions.map((s, i) => (
                    <li key={s.placeId}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          selectSuggestion(s)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm ${
                          i === highlightedIndex
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent/50"
                        }`}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              aria-label="Use current location"
              onClick={() => userLocation.request()}
              className="border-2 border-border px-3 py-1 text-xs font-medium tracking-wider uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {userLocation.loading ? (
                <LoaderIcon className="size-3.5 animate-spin" />
              ) : (
                <NavigationIcon className="size-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="border-2 border-border bg-transparent py-1.5 px-3 text-xs font-medium tracking-wider uppercase text-foreground focus:border-primary focus:outline-none"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} mi
                </option>
              ))}
            </select>
          </div>

          {isActive && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Within {radius} mi of {label}
              </span>
              <button
                type="button"
                aria-label="Clear distance filter"
                onClick={clearFilter}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  )
}
