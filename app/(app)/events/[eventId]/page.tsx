import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ExternalLinkIcon,
  TagIcon,
} from 'lucide-react';
import { fetchEventById } from '@/lib/google-calendar';
import { stripHtml } from '@/lib/format';
import { ExpandableImage } from '@/components/expandable-image';
import type { CalendarEvent } from '@/lib/types';

type PageProps = {
  params: Promise<{ eventId: string }>;
};

async function getCachedEvent(eventId: string): Promise<CalendarEvent | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag('event-detail', `event-${eventId}`);

  return fetchEventById(eventId);
}

export async function generateMetadata({ params }: PageProps) {
  const { eventId } = await params;
  const event = await getCachedEvent(eventId);

  if (!event) return { title: 'Event Not Found | Lowell Is Queer' };

  return {
    title: `${event.title} | Lowell Is Queer`,
    description: event.description
      ? stripHtml(event.description).slice(0, 160)
      : `${event.title} — ${event.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })}`,
  };
}

function EventDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-9 w-80 rounded bg-muted" />
      <div className="mb-8 space-y-3">
        <div className="h-5 w-64 rounded bg-muted" />
        <div className="h-5 w-48 rounded bg-muted" />
        <div className="h-5 w-56 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}

function EventDetailView({ event }: { event: CalendarEvent }) {
  const startDate = event.start.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });

  const startTime = event.isAllDay
    ? null
    : event.start.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
      });

  const endTime = event.isAllDay
    ? null
    : event.end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
      });

  const descriptionHtml = event.description || null;

  const mapsQuery = encodeURIComponent(event.location);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <>
      {event.imageUrl && <ExpandableImage src={event.imageUrl} />}
      <h1 className="mb-8 font-heading text-3xl font-black tracking-tight">{event.title}</h1>

      <div className="mb-10 space-y-4 border-l-[3px] border-spectrum-blue pl-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <CalendarIcon className="size-4 shrink-0 text-spectrum-red" />
          <span className="text-base font-light">{startDate}</span>
        </div>

        {startTime && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <ClockIcon className="size-4 shrink-0 text-spectrum-orange" />
            <span className="text-base font-light">
              {startTime}
              {endTime && ` — ${endTime}`}
            </span>
          </div>
        )}

        {event.isAllDay && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <ClockIcon className="size-4 shrink-0 text-spectrum-orange" />
            <span className="text-base font-light">All day</span>
          </div>
        )}

        {event.location && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
          >
            <MapPinIcon className="size-4 shrink-0 text-spectrum-green" />
            <span className="text-base font-light underline decoration-muted-foreground/50 underline-offset-2">
              {event.location}
            </span>
          </a>
        )}

        {event.tags.length > 0 && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <TagIcon className="size-4 shrink-0 text-spectrum-purple" />
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-2 border-border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {descriptionHtml && (
        <div
          className="prose-content mb-10"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <a
          href={event.htmlLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border-2 border-primary bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLinkIcon className="size-3.5" />
          Open in Google Calendar
        </a>
      </div>
    </>
  );
}

async function EventDetailLoader({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getCachedEvent(eventId);
  if (!event) notFound();
  return <EventDetailView event={event} />;
}

export default function EventDetailPage({ params }: PageProps) {
  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      <Link
        href="/calendar"
        className="mb-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeftIcon className="size-3" />
        Back to Calendar
      </Link>

      <Suspense fallback={<EventDetailSkeleton />}>
        <EventDetailLoader params={params} />
      </Suspense>
    </div>
  );
}
