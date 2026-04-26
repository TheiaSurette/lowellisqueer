import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { PlusCircleIcon } from 'lucide-react';
import { GoogleCalendarIcon } from '@/components/icons/google-calendar';
import { fetchEvents, getAddToCalendarUrl, getEmbedUrl } from '@/lib/google-calendar';
import { CalendarViewToggle } from '@/components/calendar-view-toggle';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { ScheduleList } from '@/components/schedule-list';
import { ScheduleSkeleton } from '@/components/events-skeleton';

export const metadata: Metadata = {
  title: 'Calendar | Lowell Is Queer',
  description: 'Full calendar of LGBTQ+ events in Lowell, MA',
};

async function ScheduleView() {
  'use cache';
  cacheLife('minutes');
  cacheTag('events');

  const events = await fetchEvents({ maxResults: 100 });

  if (events.length === 0) {
    return <p className="text-muted-foreground">No upcoming events. Check back soon!</p>;
  }

  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    location: e.location,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    isAllDay: e.isAllDay,
    tags: e.tags,
  }));

  return <ScheduleList events={serialized} />;
}

export default function CalendarPage() {
  const addToCalendarUrl = getAddToCalendarUrl();
  const embedUrl = getEmbedUrl('MONTH');
  const formUrl = process.env.NEXT_PUBLIC_EVENT_FORM_URL;

  return (
    <div className="mx-auto max-w-[1100px] px-8 py-16">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-heading text-3xl font-black tracking-tight">Calendar</h1>
        <div className="flex flex-wrap gap-3">
          <a
            href={addToCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-border px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <GoogleCalendarIcon className="size-4.5" />
            Add Google Calendar
          </a>
          {formUrl && (
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-border px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <PlusCircleIcon className="size-3.5" />
              Submit Event
            </a>
          )}
        </div>
      </div>

      <CalendarViewToggle
        scheduleView={
          <Suspense fallback={<ScheduleSkeleton count={8} />}>
            <ScheduleView />
          </Suspense>
        }
        embedUrl={embedUrl}
      />

      <NewsletterSignup />
    </div>
  );
}
