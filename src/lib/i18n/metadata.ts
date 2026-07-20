import type { Metadata } from "next"

import type { Locale } from "./routing"
import { absoluteUrl } from "../site"

type OpenGraphLocale = "en_US" | "id_ID"

export function openGraphLocale(locale: Locale): OpenGraphLocale {
  return locale === "en" ? "en_US" : "id_ID"
}

export function openGraphLocaleSet(
  locale: Locale,
  availableLocales: Locale[],
): {
  locale: OpenGraphLocale
  alternateLocale?: OpenGraphLocale[]
} {
  const alternateLocale = availableLocales
    .filter(
      (available, index) =>
        available !== locale && availableLocales.indexOf(available) === index,
    )
    .map(openGraphLocale)

  return {
    locale: openGraphLocale(locale),
    ...(alternateLocale.length > 0 ? { alternateLocale } : {}),
  }
}

export function buildPageAlternates(input: {
  canonicalPath: string
  languages: Partial<Record<Locale, string>>
}): Metadata["alternates"] {
  const languages: Partial<Record<Locale, string>> = {}

  for (const locale of ["en", "id"] as const) {
    const path = input.languages[locale]
    if (path) languages[locale] = absoluteUrl(path)
  }

  return {
    canonical: absoluteUrl(input.canonicalPath),
    languages,
  }
}
