import { Resend } from 'resend';
import { fetchEvents } from '@/lib/google-calendar';
import { WeeklyDigestEmail } from './weekly-digest';

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

export async function sendWeeklyDigest(options?: { weekOf?: Date }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const fromAddress = process.env.RESEND_FROM_ADDRESS;
  const siteUrl = process.env.SITE_URL ?? 'https://lowellisqueer.com';

  if (!audienceId || !fromAddress) {
    throw new Error('Missing RESEND_AUDIENCE_ID or RESEND_FROM_ADDRESS');
  }

  const { start, end } = getWeekBounds(options?.weekOf ?? new Date());

  const events = await fetchEvents({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 50,
  });

  const weekLabel = start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });

  const subject = events.length > 0
    ? `This week in queer Lowell — ${weekLabel}`
    : `Lowell Is Queer — Week of ${weekLabel}`;

  const { data, error } = await resend.broadcasts.create({
    audienceId,
    from: fromAddress,
    subject,
    react: WeeklyDigestEmail({ events, weekStart: start, siteUrl }),
    name: `Weekly Digest — ${weekLabel}`,
    send: true,
  });

  if (error) {
    throw new Error(`Failed to send weekly digest: ${error.message}`);
  }

  return { broadcastId: data?.id, eventCount: events.length };
}
