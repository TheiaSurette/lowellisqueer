import { NextResponse, type NextRequest } from "next/server"

const API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_CALENDAR_API_KEY

type Coords = { lat: number; lng: number }

type GoogleGeocodeResult = {
  geometry: { location: { lat: number; lng: number } }
  formatted_address: string
}

type PlacesAutocompleteResponse = {
  suggestions: Array<{
    placePrediction: {
      placeId: string
      text: { text: string }
    }
  }>
}

type PlaceDetailsResponse = {
  location: { latitude: number; longitude: number }
}

const cache = new Map<string, Coords | null>()

async function googleGeocode(address: string): Promise<Coords | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data: { results: GoogleGeocodeResult[]; status: string } =
    await res.json()
  if (data.status !== "OK" || !data.results.length) return null
  const { lat, lng } = data.results[0].geometry.location
  return { lat, lng }
}

async function placesLookup(placeId: string): Promise<Coords | null> {
  const url = `https://places.googleapis.com/v1/places/${placeId}`
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask": "location",
    },
  })
  if (!res.ok) return null
  const data: PlaceDetailsResponse = await res.json()
  if (!data.location) return null
  return { lat: data.location.latitude, lng: data.location.longitude }
}

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 },
    )
  }

  const placeId = request.nextUrl.searchParams.get("place_id")
  if (placeId) {
    const coords = await placesLookup(placeId)
    return NextResponse.json(coords)
  }

  const q = request.nextUrl.searchParams.get("q")
  if (!q?.trim() || q.trim().length < 2) {
    return NextResponse.json([])
  }

  const res = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({ input: q }),
    },
  )
  if (!res.ok) return NextResponse.json([])

  const data: PlacesAutocompleteResponse = await res.json()
  const suggestions = (data.suggestions ?? [])
    .filter((s) => s.placePrediction)
    .map((s) => ({
      label: s.placePrediction.text.text,
      placeId: s.placePrediction.placeId,
    }))

  return NextResponse.json(suggestions)
}

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 },
    )
  }

  const body: unknown = await request.json()
  if (!Array.isArray(body) || !body.every((q) => typeof q === "string")) {
    return NextResponse.json(
      { error: "Body must be a string array" },
      { status: 400 },
    )
  }

  const locations = body as string[]
  const results: Record<string, Coords> = {}
  let missCount = 0

  console.log(`[geocode] Batch request: ${locations.length} locations`)

  for (const q of locations) {
    if (!q.trim()) continue

    if (cache.has(q)) {
      const cached = cache.get(q)
      if (cached) results[q] = cached
      continue
    }

    const coords = await googleGeocode(q)
    cache.set(q, coords)
    if (coords) {
      console.log(`[geocode] OK "${q}" -> ${coords.lat}, ${coords.lng}`)
      results[q] = coords
    } else {
      console.warn(`[geocode] MISS "${q}"`)
      missCount++
    }
  }

  console.log(
    `[geocode] Done: ${Object.keys(results).length} resolved, ${missCount} missed`,
  )

  return NextResponse.json(results)
}
