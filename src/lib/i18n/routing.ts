export const locales = ["en", "id"] as const

export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

export function assertLocale(value: string): Locale {
  if (!isLocale(value)) {
    throw new Error(`Unsupported locale: ${value}`)
  }

  return value
}

export function localizedPath(
  locale: Locale,
  ...decodedSegments: string[]
): string {
  const encodedSegments = decodedSegments.map((segment) =>
    encodeURIComponent(segment),
  )

  return `/${[locale, ...encodedSegments].join("/")}`
}

export function homePath(locale: Locale): string {
  return localizedPath(locale)
}

export function journalPath(locale: Locale): string {
  return localizedPath(locale, "jurnal")
}

export function articlePath(locale: Locale, decodedSlug: string): string {
  return localizedPath(locale, "jurnal", decodedSlug)
}

export function portfolioPath(locale: Locale): string {
  return localizedPath(locale, "portfolio")
}

export function projectPath(locale: Locale, decodedSlug: string): string {
  return localizedPath(locale, "portfolio", decodedSlug)
}

export function replacePathLocale(
  path: string,
  locale: Locale,
): string | null {
  const match = path.match(/^\/([^/?#]+)(?=\/|\?|#|$)/)

  if (!match || !isLocale(match[1])) {
    return null
  }

  return `/${locale}${path.slice(match[0].length)}`
}
