"use client"

import { useState, useRef } from "react"
import {
  XIcon,
  CheckIcon,
  ImageIcon,
  Loader2Icon,
} from "lucide-react"
import { SPECTRUM, spectrumColor } from "@/lib/spectrum"

type FormState = "idle" | "submitting" | "success" | "error"

export function EventSubmitForm() {
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleImageChange(file: File | null) {
    if (!file) {
      setImagePreview(null)
      setImageFile(null)
      return
    }

    if (!file.type.startsWith("image/")) return

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageChange(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState("submitting")
    setErrorMessage(null)

    const formData = new FormData(e.currentTarget)

    if (imageFile) {
      formData.set("image", imageFile)
    }

    try {
      const res = await fetch("/api/submit-event", {
        method: "POST",
        body: formData,
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setFormState("error")
        setErrorMessage(data.error ?? "Something went wrong. Please try again.")
      } else {
        setFormState("success")
        formRef.current?.reset()
        setImagePreview(null)
        setImageFile(null)
      }
    } catch {
      setFormState("error")
      setErrorMessage(
        "Failed to submit. Please check your connection and try again."
      )
    }
  }

  if (formState === "success") {
    return (
      <div className="border-2 border-border px-8 py-16 text-center">
        <div className="mb-6 flex justify-center gap-2">
          {SPECTRUM.map((color, i) => (
            <span
              key={i}
              className="size-2 rounded-full animate-pulse"
              style={{ background: color, animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <div className="mx-auto mb-4 flex size-12 items-center justify-center border-2 border-spectrum-green">
          <CheckIcon className="size-6 text-spectrum-green" />
        </div>
        <h2 className="font-heading text-2xl font-bold">Event Submitted</h2>
        <p className="mt-3 text-sm font-light text-muted-foreground">
          Thanks for sharing your event with the community. We&apos;ll review it
          and add it to the calendar soon.
        </p>
        <button
          onClick={() => setFormState("idle")}
          className="mt-8 inline-flex items-center gap-2 border-2 border-primary bg-primary px-6 py-2.5 text-xs font-medium tracking-wider text-primary-foreground uppercase transition-colors hover:bg-primary/90"
        >
          Submit Another Event
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase"
          >
            <span
              className="size-[5px] rounded-full"
              style={{ background: spectrumColor(0) }}
            />
            Name / Organization
            <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Your name or organization"
            className="w-full border-2 border-border bg-transparent px-4 py-3 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="title"
            className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase"
          >
            <span
              className="size-[5px] rounded-full"
              style={{ background: spectrumColor(1) }}
            />
            Event Title
            <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="What's the event called?"
            className="w-full border-2 border-border bg-transparent px-4 py-3 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase"
        >
          <span
            className="size-[5px] rounded-full"
            style={{ background: spectrumColor(2) }}
          />
          Event Description
          <span className="text-primary">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          placeholder="Tell us about your event..."
          className="w-full resize-y border-2 border-border bg-transparent px-4 py-3 text-sm font-light leading-relaxed tracking-wide text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="datetime"
            className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase"
          >
            <span
              className="size-[5px] rounded-full"
              style={{ background: spectrumColor(3) }}
            />
            Date & Time
            <span className="text-primary">*</span>
          </label>
          <input
            type="datetime-local"
            id="datetime"
            name="datetime"
            required
            className="w-full border-2 border-border bg-transparent px-4 py-3 text-sm font-light tracking-wide text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="location"
            className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase"
          >
            <span
              className="size-[5px] rounded-full"
              style={{ background: spectrumColor(4) }}
            />
            Location
            <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            required
            placeholder="Where is the event?"
            className="w-full border-2 border-border bg-transparent px-4 py-3 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase">
          <span
            className="size-[5px] rounded-full"
            style={{ background: spectrumColor(5) }}
          />
          Event Image
          <span className="font-normal normal-case tracking-normal text-muted-foreground">
            (optional)
          </span>
        </label>

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Event image preview"
              className="max-h-64 w-full border-2 border-border object-cover object-center"
            />
            <button
              type="button"
              onClick={() => handleImageChange(null)}
              className="absolute top-3 right-3 flex size-8 items-center justify-center bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-destructive hover:text-white"
              aria-label="Remove image"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            className={`flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed px-8 py-12 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/40"
            }`}
          >
            <ImageIcon className="size-8 text-muted-foreground/40" />
            <div className="text-center">
              <p className="text-sm font-light text-muted-foreground">
                Drag and drop an image, or{" "}
                <span className="font-medium text-primary">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                PNG, JPG, or WebP up to 10MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
        />
      </div>

      <div>
        <label
          htmlFor="instagram"
          className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase"
        >
          <span
            className="size-[5px] rounded-full"
            style={{ background: spectrumColor(0) }}
          />
          Instagram Link
          <span className="font-normal normal-case tracking-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <input
          type="url"
          id="instagram"
          name="instagram"
          placeholder="https://instagram.com/..."
          className="w-full border-2 border-border bg-transparent px-4 py-3 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
      </div>

      {formState === "error" && errorMessage && (
        <p className="text-sm font-light text-destructive">{errorMessage}</p>
      )}

      <div className="flex items-center gap-6 pt-2 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <button
          type="submit"
          disabled={formState === "submitting"}
          className="inline-flex items-center gap-2 border-2 border-primary bg-primary px-8 py-3 text-xs font-medium tracking-wider text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {formState === "submitting" ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Event"
          )}
        </button>
        <p className="text-xs font-light text-muted-foreground/60">
          All submissions are reviewed before being added to the calendar.
        </p>
      </div>
    </form>
  )
}
