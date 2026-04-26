import { Resend } from 'resend';
import { WeeklyDigestEmail } from '../lib/email/weekly-digest';
import type { CalendarEvent } from '../lib/types';

const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY!;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;

async function fetchEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    key: API_KEY,
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Calendar API: ${res.status}`);

  const data = await res.json();
  return (data.items ?? []).map((e: Record<string, unknown>) => {
    const start = (e.start as Record<string, string>);
    const end = (e.end as Record<string, string>);
    const desc = (e.description as string) ?? '';
    const tagMatch = desc.match(/#tags:\s*"([^"]*)"/i);
    const tags = tagMatch ? tagMatch[1].split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    return {
      id: e.id as string,
      title: (e.summary as string) ?? '(No title)',
      description: desc.replace(/#featured\s*/gi, '').replace(/#image:\s*(?:<a[^>]*>)?https?:\/\/[^\s<]+(?:<\/a>)?\s*/gi, '').replace(/#tags:\s*"[^"]*"\s*/gi, '').trim(),
      location: (e.location as string) ?? '',
      start: new Date(start.dateTime ?? start.date),
      end: new Date(end.dateTime ?? end.date),
      isAllDay: !start.dateTime,
      colorId: (e.colorId as string) ?? null,
      imageUrl: null,
      featured: desc.includes('#featured'),
      tags,
      htmlLink: e.htmlLink as string,
    };
  });
}

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const audienceId = process.env.RESEND_AUDIENCE_ID!;
  const from = process.env.RESEND_FROM_ADDRESS!;
  const siteUrl = process.env.SITE_URL ?? 'https://lowellisqueer.com';

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  console.log(`Fetching events for ${start.toDateString()} – ${end.toDateString()}...`);
  const events = await fetchEvents(start.toISOString(), end.toISOString());
  console.log(`Found ${events.length} event(s)`);

  const weekLabel = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/New_York' });
  const subject = events.length > 0
    ? `This week in queer Lowell — ${weekLabel}`
    : `Lowell Is Queer — Week of ${weekLabel}`;

  console.log(`Sending broadcast: "${subject}"...`);
  const { data, error } = await resend.broadcasts.create({
    audienceId,
    from,
    subject,
    react: WeeklyDigestEmail({ events, weekStart: start, siteUrl }),
    name: `Weekly Digest — ${weekLabel}`,
    send: true,
  });

  if (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }

  console.log(`Sent! Broadcast ID: ${data?.id}`);
}

main();
