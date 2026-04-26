import type { CalendarEvent } from './types';

const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars';

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  colorId?: string;
  htmlLink: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
};

type GoogleCalendarResponse = {
  items: GoogleCalendarEvent[];
};

function extractImageUrl(description: string): string | null {
  // Match #image: followed by a URL (possibly wrapped in an <a> tag by Google)
  const match = description.match(
    /#image:\s*(?:<a[^>]*>)?(https?:\/\/[^\s<]+)(?:<\/a>)?/i,
  );
  if (!match) return null;

  const url = match[1];

  // Convert Google Drive links to direct image URLs
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  return url;
}

function extractTags(description: string): string[] {
  const match = description.match(/#tags:\s*"([^"]*)"/i);
  if (!match) return [];
  return match[1].split(',').map((t) => t.trim()).filter(Boolean);
}

function stripTags(description: string): string {
  return description
    .replace(/#featured\s*/gi, '')
    .replace(/#image:\s*(?:<a[^>]*>)?https?:\/\/[^\s<]+(?:<\/a>)?\s*/gi, '')
    .replace(/#tags:\s*"[^"]*"\s*/gi, '')
    .trim();
}

function normalizeEvent(event: GoogleCalendarEvent): CalendarEvent {
  const isAllDay = !event.start.dateTime;
  const rawDescription = event.description ?? '';

  return {
    id: event.id,
    title: event.summary ?? '(No title)',
    description: stripTags(rawDescription),
    location: event.location ?? '',
    start: new Date(event.start.dateTime ?? event.start.date!),
    end: new Date(event.end.dateTime ?? event.end.date!),
    isAllDay,
    colorId: event.colorId ?? null,
    imageUrl: extractImageUrl(rawDescription),
    featured: rawDescription.includes('#featured'),
    tags: extractTags(rawDescription),
    htmlLink: event.htmlLink,
  };
}

export async function fetchEvents(options?: {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
}): Promise<CalendarEvent[]> {
  if (!API_KEY || !CALENDAR_ID) {
    console.warn('Google Calendar API key or Calendar ID not configured');
    return [];
  }

  const timeMin = options?.timeMin ?? new Date().toISOString();
  const maxResults = options?.maxResults ?? 50;

  const params = new URLSearchParams({
    key: API_KEY,
    timeMin,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(maxResults),
  });

  if (options?.timeMax) {
    params.set('timeMax', options.timeMax);
  }

  const url = `${BASE_URL}/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    console.error(
      `Google Calendar API error: ${response.status} ${response.statusText}`,
    );
    return [];
  }

  const data: GoogleCalendarResponse = await response.json();
  return data.items.map(normalizeEvent);
}

export async function fetchEventById(eventId: string): Promise<CalendarEvent | null> {
  if (!API_KEY || !CALENDAR_ID) {
    console.warn('Google Calendar API key or Calendar ID not configured');
    return null;
  }

  const params = new URLSearchParams({ key: API_KEY });
  const url = `${BASE_URL}/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) return null;
    console.error(`Google Calendar API error: ${response.status} ${response.statusText}`);
    return null;
  }

  const event: GoogleCalendarEvent = await response.json();
  return normalizeEvent(event);
}

export function filterFeatured(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((e) => e.featured);
}

export function getAddToCalendarUrl(): string {
  const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID ?? '';
  const cid = btoa(calendarId);
  return `https://calendar.google.com/calendar/u/0?cid=${cid}`;
}

export function getEmbedUrl(mode: 'MONTH' | 'AGENDA' = 'MONTH'): string {
  const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID ?? '';
  return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America/New_York&mode=${mode}`;
}
