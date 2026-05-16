export type CalendarEvent = {
  id: string
  title: string
  description: string
  location: string
  start: Date
  end: Date
  isAllDay: boolean
  colorId: string | null
  imageUrl: string | null
  featured: boolean
  tags: string[]
  htmlLink: string
}

export type SerializedCalendarEvent = {
  id: string
  title: string
  location: string
  start: string
  end: string
  isAllDay: boolean
  tags: string[]
  description?: string
  imageUrl?: string
  featured?: boolean
}

export function serializeEvent(event: CalendarEvent): SerializedCalendarEvent {
  return {
    id: event.id,
    title: event.title,
    location: event.location,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    isAllDay: event.isAllDay,
    tags: event.tags,
    description: event.description,
    imageUrl: event.imageUrl ?? undefined,
    featured: event.tags.includes("Featured") || undefined,
  }
}

export type SocialLink = {
  platform: string
  url: string
  icon?: string
}

export type Meetup = {
  name: string
  description: string
  details: string
  location: string
  frequency: string
  image: string
  section: string
}

export type PrideSpotlight = {
  name: string
  location: string
  description: string
  website?: string
}

export type Resource = {
  name: string
  description: string
  location: string
  phone: string
  email: string
  schedule: string
  url: string
}
