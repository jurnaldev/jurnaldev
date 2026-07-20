"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useLang } from "@/contexts/lang-context"
import {
  locales,
  replacePathLocale,
  type Locale,
} from "@/lib/i18n/routing"

const localeNames: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
}

export function LangToggle({
  alternateHref,
}: {
  alternateHref?: string | null
}): React.ReactNode {
  const { lang } = useLang()
  const pathname = usePathname()
  const alternateLocale = lang === "en" ? "id" : "en"
  const derivedHref = pathname
    ? replacePathLocale(pathname, alternateLocale)
    : null
  const targetHref =
    alternateHref === undefined ? derivedHref : alternateHref

  const optionStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 10px",
    background: active ? "var(--text)" : "transparent",
    color: active ? "var(--bg)" : "var(--text-muted)",
    border: "none",
    cursor: active ? "default" : "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
    fontSize: "inherit",
    textDecoration: "none",
  })

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        overflow: "hidden",
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: "11px",
      }}
    >
      {locales.map((locale) => {
        if (locale === lang) {
          return (
            <span
              key={locale}
              aria-current="page"
              aria-label={`${localeNames[locale]} (current language)`}
              style={optionStyle(true)}
            >
              {locale}
            </span>
          )
        }

        if (!targetHref) {
          return (
            <span
              key={locale}
              aria-disabled="true"
              aria-label={`${localeNames[locale]}: Translation unavailable`}
              title="Translation unavailable"
              style={{
                ...optionStyle(false),
                cursor: "not-allowed",
                opacity: 0.5,
              }}
            >
              {locale}
            </span>
          )
        }

        return (
          <Link
            key={locale}
            href={targetHref}
            aria-label={`Switch to ${localeNames[locale]}`}
            style={optionStyle(false)}
          >
            {locale}
          </Link>
        )
      })}
    </div>
  )
}
