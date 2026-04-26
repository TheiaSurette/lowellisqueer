'use client';

import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { CalendarClockIcon, MapPinIcon, XIcon } from 'lucide-react';
import type { Meetup } from '@/lib/types';
import { MeetupCard } from './meetup-card';

export function MeetupWithDialog({ meetup, index }: { meetup: Meetup; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="w-full cursor-pointer text-left"
        nativeButton={false}
        render={<div role="button" tabIndex={0} />}
      >
        <MeetupCard meetup={meetup} index={index} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 border-2 border-border bg-background p-6 shadow-lg transition-all data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <Dialog.Title className="font-heading text-xl font-bold">
            {meetup.name}
          </Dialog.Title>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
              <CalendarClockIcon className="size-3.5 shrink-0" />
              <span>{meetup.frequency}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" />
              <span>{meetup.location}</span>
            </div>
          </div>
          <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
            {meetup.details}
          </p>
          <Dialog.Close className="absolute top-4 right-4 cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
            <XIcon className="size-4" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
