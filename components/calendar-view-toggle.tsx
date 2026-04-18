'use client';

import { useState, type ReactNode } from 'react';
import { ListIcon, CalendarIcon } from 'lucide-react';

export function CalendarViewToggle({
  scheduleView,
  embedUrl,
}: {
  scheduleView: ReactNode;
  embedUrl: string;
}) {
  const [view, setView] = useState<'schedule' | 'calendar'>('schedule');

  return (
    <div>
      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setView('schedule')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
            view === 'schedule'
              ? 'border-2 border-primary bg-primary text-primary-foreground'
              : 'border-2 border-border text-muted-foreground hover:border-primary hover:text-primary'
          }`}
        >
          <ListIcon className="size-3.5" />
          Schedule
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
            view === 'calendar'
              ? 'border-2 border-primary bg-primary text-primary-foreground'
              : 'border-2 border-border text-muted-foreground hover:border-primary hover:text-primary'
          }`}
        >
          <CalendarIcon className="size-3.5" />
          Calendar
        </button>
      </div>

      {view === 'schedule' ? (
        scheduleView
      ) : (
        <div className="overflow-hidden border-2 border-border">
          <iframe
            src={embedUrl}
            className="h-[600px] w-full border-0"
            title="Google Calendar"
          />
        </div>
      )}
    </div>
  );
}
