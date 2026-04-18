import Image from 'next/image';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { getSocialLinks } from '@/lib/content';
import { SpectrumDots } from '@/components/spectrum-dots';
import { ThemeToggle } from '@/components/theme-toggle';
import { SPECTRUM } from '@/lib/spectrum';

const NAV_SEPS = [SPECTRUM[0], SPECTRUM[1], SPECTRUM[2]];

async function Footer() {
  'use cache';
  cacheLife('max');

  const socialLinks = await getSocialLinks();

  return (
    <footer className="mx-auto max-w-[1100px] px-8">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 border-t-2 border-primary py-8">
        <p className="text-xs font-light tracking-widest text-muted-foreground">
          &copy; {new Date().getFullYear()} Lowell Is Queer
        </p>
        <SpectrumDots />
        {socialLinks.length > 0 ? (
          <div className="flex justify-end gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-normal uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
              >
                {link.platform}
              </a>
            ))}
          </div>
        ) : (
          <div />
        )}
      </div>
      <div className="flex items-center justify-between pb-6">
        <p className="text-xs font-light tracking-widest text-muted-foreground/50">
          Site by <a href="https://tsurette.com" target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-muted-foreground">Theia</a>
        </p>
        <div className="flex items-center gap-2.5">
          <span className="text-[0.6rem] tracking-widest text-muted-foreground/40 max-sm:hidden">
            press D to toggle
          </span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const formUrl = process.env.NEXT_PUBLIC_EVENT_FORM_URL;

  return (
    <>
      <header className="mx-auto max-w-[1100px] px-8 pt-8">
        <div className="flex items-center justify-between border-b-2 border-primary pb-5 max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-heading text-lg font-black tracking-wider">
            <Image src="/lowell-logo.png" alt="" width={40} height={40} className="size-10 -translate-y-1" />
            Lowell Is Queer
          </Link>
          <nav className="flex items-center max-sm:pl-0.5">
            <Link
              href="/calendar"
              className="px-3.5 text-xs font-light uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
            >
              Calendar
            </Link>
            <span
              className="size-[5px] shrink-0 rounded-full"
              style={{ background: NAV_SEPS[0] }}
            />
            <Link
              href="/about"
              className="px-3.5 text-xs font-light uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
            {formUrl && (
              <>
                <span
                  className="size-[5px] shrink-0 rounded-full"
                  style={{ background: NAV_SEPS[1] }}
                />
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 text-xs font-light uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
                >
                  Submit
                </a>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="min-h-svh">{children}</main>
      <Footer />
    </>
  );
}
