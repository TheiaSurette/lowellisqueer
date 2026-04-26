import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import type { Resource } from '@/lib/types';

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="-mx-4 block border-b border-border px-4 py-8 transition-colors hover:bg-accent/50"
    >
      <h3 className="font-heading text-lg font-bold">{resource.name}</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
        {resource.description}
      </p>
      <div className="mt-3 space-y-1">
        {resource.phone && (
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <PhoneIcon className="size-3.5 shrink-0" />
            <span>{resource.phone}</span>
          </div>
        )}
        {resource.email && (
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <MailIcon className="size-3.5 shrink-0" />
            <span>{resource.email}</span>
          </div>
        )}
        {resource.schedule && (
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <ClockIcon className="size-3.5 shrink-0" />
            <span>{resource.schedule}</span>
          </div>
        )}
        {resource.location && (
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <MapPinIcon className="size-3.5 shrink-0" />
            <span>{resource.location}</span>
          </div>
        )}
      </div>
    </a>
  );
}
