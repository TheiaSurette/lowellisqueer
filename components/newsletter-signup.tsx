'use client';

import { useState, useTransition } from 'react';
import { MailIcon } from 'lucide-react';
import { spectrumColor } from '@/lib/spectrum';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error ?? 'Something went wrong.');
      } else {
        setIsError(false);
        setMessage(data.message ?? "You're subscribed!");
        setEmail('');
      }
    });
  }

  return (
    <div className="py-14">
      <div className="mx-auto max-w-[1100px] px-8">
        <div className="flex items-center gap-3 mb-2">
          <MailIcon className="size-5" style={{ color: spectrumColor(3) }} />
          <h2 className="font-heading text-2xl font-bold">Stay in the loop</h2>
        </div>
        <p className="mb-6 text-sm font-light text-muted-foreground">
          Get notified about upcoming LGBTQIA+ events in the Lowell area.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 max-sm:flex-col">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 border-2 border-border bg-transparent px-4 py-2.5 text-sm font-light tracking-wide text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 border-2 border-primary bg-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p className={`mt-3 text-sm font-light ${isError ? 'text-destructive' : 'text-foreground'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
