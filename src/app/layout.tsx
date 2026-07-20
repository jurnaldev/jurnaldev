import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/contexts/theme-context"
import { LangProvider } from "@/contexts/lang-context"
import { themeScript } from "@/lib/theme-script"
import { SITE_URL } from "@/lib/site"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fahmi — jurnal.dev",
    template: "%s · jurnal.dev",
  },
  description:
    "Backend engineer learning AI, out loud. A journal from the messy middle of learning something new.",
  keywords: [
    "Fahmi",
    "Fahmi Hidayat",
    "jurnal.dev",
    "backend engineer",
    "AI",
    "software engineer",
    "Indonesia",
    "learning in public",
  ],
  authors: [{ name: "Fahmi Hidayat" }],
  creator: "Fahmi Hidayat",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "id_ID",
    url: "https://jurnal.dev",
    siteName: "jurnal.dev",
    title: "Fahmi — jurnal.dev",
    description:
      "Backend engineer learning AI, out loud. A journal from the messy middle of learning something new.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fahmi — jurnal.dev",
    description: "Backend engineer learning AI, out loud.",
    creator: "@DevJurnal",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LangProvider>{children}</LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
