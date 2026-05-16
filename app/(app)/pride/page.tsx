import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { cacheLife, cacheTag } from "next/cache"
import { fetchEvents } from "@/lib/google-calendar"
import { getPrideSpotlights } from "@/lib/content"
import { SPECTRUM_GRADIENT } from "@/lib/spectrum"
import { serializeEvent } from "@/lib/types"
import { SpectrumDots } from "@/components/spectrum-dots"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { PrideGallery, PrideGallerySkeleton } from "@/components/pride-gallery"

export const metadata: Metadata = {
  title: "Lowell Pride | Lowell Is Queer",
  description: "Lowell Pride events celebrating LGBTQ+ life in Lowell, MA",
}

async function PrideGalleryLoader() {
  "use cache"
  cacheLife("minutes")
  cacheTag("pride-events")

  const [events, spotlights] = await Promise.all([
    fetchEvents({ maxResults: 500 }),
    getPrideSpotlights(),
  ])
  const now = new Date()
  const prideEvents = events.filter(
    (e) => e.tags.includes("LowellPride") && e.end > now
  )

  if (prideEvents.length === 0) {
    return (
      <div className="py-16 text-center">
        <SpectrumDots size={10} gap={8} />
        <p className="mt-6 text-muted-foreground">
          No Lowell Pride events scheduled yet. Check back soon!
        </p>
      </div>
    )
  }

  const serialized = prideEvents.map(serializeEvent)

  const heroEvents = serialized.filter((e) => e.tags.includes("PrideFeatured"))
  const fallback =
    heroEvents.length === 0 && serialized[0] ? [serialized[0]] : []

  return (
    <PrideGallery
      events={serialized}
      heroEvents={heroEvents.length > 0 ? heroEvents : fallback}
      spotlights={spotlights}
    />
  )
}

export default function PridePage() {
  return (
    <>
      <div
        className="h-1.5 pride-shimmer"
        style={{
          backgroundImage: SPECTRUM_GRADIENT,
        }}
      />

      <Suspense fallback={<PrideGallerySkeleton />}>
        <PrideGalleryLoader />
      </Suspense>

      <NewsletterSignup />

      <section className="bg-secondary py-10">
        <div className="mx-auto max-w-[1100px] px-8 text-center">
          <Link
            href="/calendar"
            className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            View full calendar &rarr;
          </Link>
        </div>
      </section>
    </>
  )
}
