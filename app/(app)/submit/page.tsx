import type { Metadata } from "next"
import { EventSubmitForm } from "@/components/event-submit-form"
import { SPECTRUM } from "@/lib/spectrum"

export const metadata: Metadata = {
  title: "Submit an Event | Lowell Is Queer",
  description:
    "Submit your LGBTQ+ event to the Lowell Is Queer community calendar",
}

export default function SubmitPage() {
  return (
    <>
      <section className="mx-auto max-w-[1100px] px-8 pt-12 pb-14">
        <div className="mb-3 flex items-center gap-2">
          {SPECTRUM.map((color, i) => (
            <span
              key={i}
              className="size-[5px] rounded-full"
              style={{ background: color }}
            />
          ))}
        </div>
        <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
          Submit Your Event
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed font-light text-muted-foreground">
          Share your LGBTQIA+ event with the Lowell community. Fill out the form
          below and we&apos;ll add it to the calendar.
        </p>
      </section>

      <section className="mx-auto max-w-[1100px] px-8 pb-20">
        <EventSubmitForm />
      </section>
    </>
  )
}
