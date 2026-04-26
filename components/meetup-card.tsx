import Image from 'next/image';
import { CalendarClockIcon, MapPinIcon } from 'lucide-react';
import type { Meetup } from '@/lib/types';
import { spectrumColor } from '@/lib/spectrum';

export function MeetupCard({ meetup, index }: { meetup: Meetup; index: number }) {
  const accent = spectrumColor(index);

  return (
    <div className="overflow-hidden border-2 border-border transition-colors hover:border-primary">
      <div className="relative aspect-[16/9] bg-accent/20">
        <Image
          src={meetup.image}
          alt={meetup.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div
          className="absolute bottom-0 left-0 h-1 w-full"
          style={{ background: accent }}
        />
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-bold">{meetup.name}</h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
          {meetup.description}
        </p>
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <MapPinIcon className="size-3.5 shrink-0" />
            <span>{meetup.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <CalendarClockIcon className="size-3.5 shrink-0" />
            <span>{meetup.frequency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
