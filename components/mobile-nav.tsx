'use client';

import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { MenuIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { SPECTRUM } from '@/lib/spectrum';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/resources', label: 'Resources' },
  { href: '/meetups', label: 'Meetups' },
];

export function MobileNav({ formUrl }: { formUrl?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="sm:hidden cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
        <MenuIcon className="size-6" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-0 left-0 right-0 z-50 border-b-2 border-primary bg-background px-8 pb-8 pt-8 shadow-lg transition-all data-[ending-style]:-translate-y-full data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-full data-[starting-style]:opacity-0">
          <div className="flex items-center justify-between mb-8">
            <span className="font-heading text-lg font-black tracking-wider">Menu</span>
            <Dialog.Close className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
              <XIcon className="size-6" />
            </Dialog.Close>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-3 text-sm font-light uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
              >
                <span
                  className="size-[6px] shrink-0 rounded-full"
                  style={{ background: SPECTRUM[i % SPECTRUM.length] }}
                />
                {link.label}
              </Link>
            ))}
            {formUrl && (
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 text-sm font-light uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
              >
                <span
                  className="size-[6px] shrink-0 rounded-full"
                  style={{ background: SPECTRUM[4] }}
                />
                Submit
              </a>
            )}
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
