import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { CalendarEvent } from '@/lib/types';

const SPECTRUM = ['#E53935', '#F4811F', '#FDCA17', '#2E9B3E', '#2B6CC4', '#7B3FA0'] as const;

const colors = {
  bg: '#FCFAF7',
  foreground: '#1C1917',
  muted: '#A8A29E',
  border: '#E7E2DD',
  primary: '#E53935',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const startStr = weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
  const endStr = end.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
  return `${startStr} – ${endStr}`;
}

type GroupedEvents = [string, CalendarEvent[]][];

function groupByDay(events: CalendarEvent[]): GroupedEvents {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = formatDate(event.start);
    const group = groups.get(key);
    if (group) group.push(event);
    else groups.set(key, [event]);
  }
  return Array.from(groups.entries());
}

export function WeeklyDigestEmail({
  events,
  weekStart,
  siteUrl,
}: {
  events: CalendarEvent[];
  weekStart: Date;
  siteUrl: string;
}) {
  const weekRange = formatWeekRange(weekStart);
  const grouped = groupByDay(events);

  return (
    <Html>
      <Head />
      <Preview>{`This week in queer Lowell: ${events.length} event${events.length !== 1 ? 's' : ''}`}</Preview>
      <Body style={{ backgroundColor: colors.bg, fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
            <Text style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: colors.muted, margin: '0 0 8px' }}>
              Weekly Digest
            </Text>
            <Heading style={{ fontSize: '28px', fontWeight: 900, color: colors.foreground, margin: '0 0 6px', lineHeight: '1.1' }}>
              Lowell Is Queer
            </Heading>
            {/* Spectrum bar */}
            <Section style={{ margin: '16px auto 0', width: '180px' }}>
              <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
                <tr>
                  {SPECTRUM.map((c) => (
                    <td key={c} style={{ height: '3px', backgroundColor: c, width: `${100 / SPECTRUM.length}%` }} />
                  ))}
                </tr>
              </table>
            </Section>
          </Section>

          {/* Week range */}
          <Text style={{ fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: colors.primary, margin: '0 0 24px' }}>
            {weekRange}
          </Text>

          {events.length === 0 ? (
            <Text style={{ fontSize: '15px', color: colors.muted, lineHeight: '1.6' }}>
              No events scheduled this week. Check back soon!
            </Text>
          ) : (
            grouped.map(([day, dayEvents], dayIndex) => (
              <Section key={day} style={{ marginBottom: '28px' }}>
                <Text style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: SPECTRUM[dayIndex % SPECTRUM.length], margin: '0 0 12px' }}>
                  {day}
                </Text>
                {dayEvents.map((event) => (
                  <Section key={event.id} style={{ borderLeft: `3px solid ${SPECTRUM[dayIndex % SPECTRUM.length]}`, paddingLeft: '16px', marginBottom: '16px' }}>
                    <Link href={`${siteUrl}/events/${event.id}`} style={{ fontSize: '17px', fontWeight: 700, color: colors.foreground, textDecoration: 'none', lineHeight: '1.3' }}>
                      {event.title}
                    </Link>
                    <Text style={{ fontSize: '13px', color: colors.muted, margin: '4px 0 0', lineHeight: '1.5' }}>
                      {event.isAllDay ? 'All day' : `${formatTime(event.start)} – ${formatTime(event.end)}`}
                      {event.location ? ` · ${event.location}` : ''}
                    </Text>
                  </Section>
                ))}
              </Section>
            ))
          )}

          <Hr style={{ borderTop: `2px solid ${colors.border}`, margin: '32px 0' }} />

          {/* Footer */}
          <Section style={{ textAlign: 'center' as const }}>
            <Link href={siteUrl} style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: colors.primary, textDecoration: 'none' }}>
              View Full Calendar →
            </Link>
            <Text style={{ fontSize: '11px', color: colors.muted, margin: '16px 0 0', lineHeight: '1.5' }}>
              You're receiving this because you subscribed to the Lowell Is Queer newsletter.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
