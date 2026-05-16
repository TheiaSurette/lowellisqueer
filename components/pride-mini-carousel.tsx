"use client"

import { useEffect, useState } from "react"

export function PrideMiniCarousel({
  images,
  alt,
}: {
  images: string[]
  alt?: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) return null

  return (
    <div className="relative aspect-[2/1] max-h-80 w-full overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alt ?? ""}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
