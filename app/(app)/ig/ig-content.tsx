"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { zipSync } from "fflate"

type SlidesResponse = {
  slides: string[]
  weekRange: string
  weekDate: string
}

function downloadSlide(base64: string, weekDate: string, index: number) {
  const blob = new Blob([base64ToBytes(base64) as BlobPart], {
    type: "image/png",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `liq-${weekDate}-slide-${index + 1}.png`
  link.click()
  URL.revokeObjectURL(url)
}

function base64ToBytes(base64: string): Uint8Array {
  const raw = atob(base64)
  const buf = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i)
  return buf
}

function downloadAll(slides: string[], weekDate: string) {
  const files: Record<string, Uint8Array> = {}
  slides.forEach((slide, i) => {
    files[`liq-${weekDate}-slide-${i + 1}.png`] = base64ToBytes(slide)
  })
  const zipped = zipSync(files, { level: 0 })
  const blob = new Blob([zipped as BlobPart], { type: "application/zip" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `liq-${weekDate}-slides.zip`
  link.click()
  URL.revokeObjectURL(url)
}

export function IgContent() {
  const [data, setData] = useState<SlidesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function fetchSlides() {
    setLoading(true)
    setError(null)
    fetch("/api/slides")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to generate slides")
        const json: SlidesResponse = await res.json()
        setData(json)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
  useEffect(() => void fetchSlides(), [])

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded bg-muted"
            />
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Generating slides...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={fetchSlides}
          className="border-2 border-border px-4 py-2 text-xs font-medium tracking-wider text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data || data.slides.length === 0) {
    return <p className="text-sm text-muted-foreground">No events this week.</p>
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm font-medium tracking-wider text-primary uppercase">
          {data.weekRange}
        </p>
        {data.slides.length > 1 && (
          <button
            onClick={() => downloadAll(data.slides, data.weekDate)}
            className="flex items-center gap-2 border-2 border-border px-4 py-2 text-xs font-medium tracking-wider text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary"
          >
            <Download className="size-3.5" />
            Download All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {data.slides.map((base64, i) => (
          <div key={i} className="group space-y-3">
            <div className="overflow-hidden border-2 border-border">
              <img
                src={`data:image/png;base64,${base64}`}
                alt={`Slide ${i + 1}`}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <button
              onClick={() => downloadSlide(base64, data.weekDate, i)}
              className="flex w-full items-center justify-center gap-2 border-2 border-border px-3 py-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary"
            >
              <Download className="size-3" />
              Slide {i + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
