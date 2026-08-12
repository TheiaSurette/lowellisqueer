import type { Metadata } from "next"
import { Fraunces, Sora, Geist_Mono } from "next/font/google"

import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display",
})

const sora = Sora({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Lowell Is Queer",
  description: "LGBTQ+ events and community happenings in Lowell, MA",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fraunces.variable,
        sora.variable,
        fontMono.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
