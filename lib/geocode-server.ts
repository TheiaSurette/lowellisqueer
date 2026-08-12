const API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_CALENDAR_API_KEY

type GoogleGeocodeResult = {
  geometry: { location: { lat: number; lng: number } }
}

const cache = new Map<string, { lat: number; lng: number } | null>()

async function geocodeOne(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  if (cache.has(address)) return cache.get(address) ?? null

  if (!API_KEY) return null

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) {
    cache.set(address, null)
    return null
  }

  const data: { results: GoogleGeocodeResult[]; status: string } =
    await res.json()
  if (data.status !== "OK" || !data.results.length) {
    cache.set(address, null)
    return null
  }

  const { lat, lng } = data.results[0].geometry.location
  const coords = { lat, lng }
  cache.set(address, coords)
  return coords
}

export async function geocodeLocations(
  locations: string[],
): Promise<Map<string, { lat: number; lng: number }>> {
  const unique = [...new Set(locations.filter((l) => l.trim()))]
  const results = new Map<string, { lat: number; lng: number }>()

  for (const loc of unique) {
    const coords = await geocodeOne(loc)
    if (coords) results.set(loc, coords)
  }

  return results
}
