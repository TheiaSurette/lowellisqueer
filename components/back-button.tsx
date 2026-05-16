"use client"

import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

export function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-8 inline-flex cursor-pointer items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
    >
      <ArrowLeftIcon className="size-3" />
      Back
    </button>
  )
}
