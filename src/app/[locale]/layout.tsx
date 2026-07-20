import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import Script from "next/script"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import { LangProvider } from "@/contexts/lang-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { openGraphLocaleSet } from "@/lib/i18n/metadata"
import { isLocale, locales } from "@/lib/i18n/routing"
import { SITE_URL } from "@/lib/site"
import { themeScript } from "@/lib/theme-script"

import "../globals.css"

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

type LocaleMetadataProps = Pick<LocaleLayoutProps, "params">

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LocaleMetadataProps): Promise<Metadata> {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Fahmi | jurnal.dev",
      template: "%s · jurnal.dev",
    },
    description:
      "Backend engineer learning AI, out loud. A journal from the messy middle of learning something new.",
    keywords: [
      "Fahmi",
      "Muhammad Fahmi",
      "Fahmi Hidayat",
      "Muhammad Fahmi Hidayat",
      "jurnal.dev",
      "jurnal dev",
      "AI",
      "Senior Software Engineer",
      "AI Engineer",
      "backend engineer",
      "software engineer",
      "Indonesia",
      "Indonesia software engineer",
      "learning in public",
    ],
    authors: [{ name: "Muhammad Fahmi Hidayat" }],
    creator: "Muhammad Fahmi Hidayat",
    openGraph: {
      type: "website",
      ...openGraphLocaleSet(candidate, [...locales]),
      siteName: "jurnal.dev",
      title: "Fahmi | jurnal.dev",
      description:
        "Backend engineer learning AI, out loud. A journal from the messy middle of learning something new.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Fahmi | jurnal.dev",
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  return (
    <html
      lang={candidate}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Script id="js-enabled-script" strategy="beforeInteractive">
          {"document.documentElement.classList.add('js')"}
        </Script>
      </head>
      <body>
        <ThemeProvider>
          <LangProvider initialLang={candidate}>{children}</LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
