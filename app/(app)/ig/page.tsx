import type { Metadata } from "next"
import { IgContent } from "./ig-content"

export const metadata: Metadata = {
  title: "IG Slides | Lowell Is Queer",
}

export default function IgPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-8 py-16">
      <h1 className="mb-10 font-heading text-3xl font-black tracking-tight">
        Instagram Slides
      </h1>
      <IgContent />
    </div>
  )
}
