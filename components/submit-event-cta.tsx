import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { spectrumColor } from "@/lib/spectrum"

export function SubmitEventCta() {
  return (
    <div className="py-14">
      <div className="mx-auto max-w-[1100px] px-8">
        <div className="border-l-[3px] pl-6" style={{ borderColor: spectrumColor(5) }}>
          <h2 className="font-heading text-xl font-bold">Have an event?</h2>
          <p className="mt-2 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
            If you&apos;re organizing an LGBTQIA+ event in the Lowell area,
            submit it for consideration on the community calendar.
          </p>
          <Link
            href="/submit"
            className="group mt-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-primary uppercase transition-colors hover:text-primary/80"
          >
            Submit an Event
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
