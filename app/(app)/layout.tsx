import Image from "next/image"
import Link from "next/link"
import { cacheLife } from "next/cache"
import { getSocialLinks } from "@/lib/content"
import { MobileNav } from "@/components/mobile-nav"
import { SpectrumDots } from "@/components/spectrum-dots"
import { ThemeToggle } from "@/components/theme-toggle"
import { SPECTRUM, SPECTRUM_GRADIENT } from "@/lib/spectrum"

const NAV_SEPS = [
  SPECTRUM[0],
  SPECTRUM[1],
  SPECTRUM[2],
  SPECTRUM[3],
  SPECTRUM[4],
]
const navLinkClass =
  "px-3.5 text-xs font-normal uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"

async function Footer() {
  "use cache"
  cacheLife("max")

  const socialLinks = await getSocialLinks()

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
                className="text-xs font-normal tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
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
          Site by{" "}
          <a
            href="https://tsurette.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-muted-foreground"
          >
            Theia
          </a>
        </p>
        <div className="flex items-center gap-2.5">
          <span className="text-[0.6rem] tracking-widest text-muted-foreground/40 max-sm:hidden">
            press D to toggle
          </span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <header className="mx-auto max-w-[1100px] px-8 pt-8">
        <div className="flex items-center justify-between pb-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-heading text-lg font-black tracking-wider"
          >
            <Image
              src="/lowell-logo.png"
              alt=""
              width={40}
              height={40}
              className="size-10 -translate-y-1"
            />
            Lowell Is Queer
          </Link>
          <MobileNav />
          <nav className="hidden items-center sm:flex">
            <Link
              href="/pride"
              className="pride-shimmer px-3.5 text-xs font-bold tracking-[0.18em] uppercase"
              style={{
                backgroundImage: SPECTRUM_GRADIENT,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pride
            </Link>
            <span
              className="size-[5px] shrink-0 rounded-full"
              style={{ background: NAV_SEPS[0] }}
            />
            <Link href="/about" className={navLinkClass}>
              About
            </Link>
            <span
              className="size-[5px] shrink-0 rounded-full"
              style={{ background: NAV_SEPS[1] }}
            />
            <Link href="/calendar" className={navLinkClass}>
              Calendar
            </Link>
            <span
              className="size-[5px] shrink-0 rounded-full"
              style={{ background: NAV_SEPS[2] }}
            />
            <Link href="/submit" className={navLinkClass}>
              Submit
            </Link>
            <span
              className="size-[5px] shrink-0 rounded-full"
              style={{ background: NAV_SEPS[3] }}
            />
            <Link href="/resources" className={navLinkClass}>
              Resources
            </Link>
            <span
              className="size-[5px] shrink-0 rounded-full"
              style={{ background: NAV_SEPS[4] }}
            />
            <Link href="/meetups" className={navLinkClass}>
              Meetups
            </Link>
          </nav>
        </div>
      </header>
      <main className="min-h-svh">{children}</main>
      <Footer />
    </>
  )
}
