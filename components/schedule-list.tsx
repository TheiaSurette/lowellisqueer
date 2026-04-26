'use client';

import { useMemo, useState } from 'react';
import fuzzysort from 'fuzzysort';
import { MapPinIcon, SearchIcon, TagIcon, XIcon } from 'lucide-react';
import { formatDay, formatWeekday, formatTime, formatMonthYear } from '@/lib/format';
import { spectrumTextColor } from '@/lib/spectrum';

type SerializedEvent = {
  id: string;
  title: string;
  location: string;
  start: string;
  end: string;
  isAllDay: boolean;
  tags: string[];
};

const PAGE_SIZE = 10;

function groupByMonth(events: SerializedEvent[]): [string, SerializedEvent[]][] {
  const groups = new Map<string, SerializedEvent[]>();
  for (const event of events) {
    const key = formatMonthYear(new Date(event.start));
    const group = groups.get(key);
    if (group) group.push(event);
    else groups.set(key, [event]);
  }
  return Array.from(groups.entries());
}

function collectTags(events: SerializedEvent[]): string[] {
  const set = new Set<string>();
  for (const e of events) {
    for (const t of e.tags) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function ScheduleList({ events }: { events: SerializedEvent[] }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => collectTags(events), [events]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setPage(1);
  }

  function clearTags() {
    setSelectedTags(new Set());
    setPage(1);
  }

  const filtered = useMemo(() => {
    let result = events;

    if (selectedTags.size > 0) {
      result = result.filter((e) =>
        e.tags.some((t) => selectedTags.has(t)),
      );
    }

    if (!query) return result;
    return fuzzysort
      .go(query, result, { keys: ['title', 'location'], threshold: 0.3 })
      .map((r) => r.obj);
  }, [query, events, selectedTags]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const grouped = groupByMonth(paged);

  let eventIndex = (safePage - 1) * PAGE_SIZE;

  return (
    <div>
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search events..."
          className="w-full border-2 border-border bg-transparent py-2 pl-9 pr-9 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <TagIcon className="size-3.5 text-muted-foreground" />
          {allTags.map((tag) => {
            const active = selectedTags.has(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`border-2 px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {tag}
              </button>
            );
          })}
          {selectedTags.size > 0 && (
            <button
              type="button"
              onClick={clearTags}
              className="ml-1 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 && (query || selectedTags.size > 0) ? (
        <p className="text-muted-foreground">
          No events matching your filters
        </p>
      ) : (
        <div className="space-y-10">
          {grouped.map(([month, monthEvents]) => (
            <div key={month}>
              <h3 className="mb-5 font-heading text-lg font-bold text-muted-foreground">
                {month}
              </h3>
              <div className="space-y-0">
                {monthEvents.map((event) => {
                  const i = eventIndex++;
                  const textColor = spectrumTextColor(i);
                  const start = new Date(event.start);

                  return (
                    <a
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group grid grid-cols-[80px_1fr_auto] items-center gap-6 border-b border-border py-5 transition-colors hover:bg-accent/40 max-sm:grid-cols-[60px_1fr] max-sm:gap-4"
                    >
                      <div className="flex-shrink-0 text-center">
                        <div
                          className="text-2xl font-bold font-heading"
                          style={{ color: textColor }}
                        >
                          {formatDay(start)}
                        </div>
                        <div
                          className="text-[0.65rem] font-medium uppercase tracking-wider"
                          style={{ color: textColor }}
                        >
                          {formatWeekday(start)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-heading font-bold group-hover:underline">
                          {event.title}
                        </h4>
                        <p className="text-sm font-light text-muted-foreground">
                          {event.isAllDay ? 'All day' : formatTime(start)}
                        </p>
                        {event.location && (
                          <div className="mt-1 flex items-center gap-1.5 text-sm font-light italic text-muted-foreground">
                            <MapPinIcon className="size-3 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        {event.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {event.tags.map((tag) => (
                              <span
                                key={tag}
                                className="border border-border px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              {safePage > 1 ? (
                <button
                  type="button"
                  onClick={() => setPage(safePage - 1)}
                  className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
                >
                  &larr; Previous
                </button>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              {safePage < totalPages ? (
                <button
                  type="button"
                  onClick={() => setPage(safePage + 1)}
                  className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
                >
                  Next &rarr;
                </button>
              ) : (
                <span />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
