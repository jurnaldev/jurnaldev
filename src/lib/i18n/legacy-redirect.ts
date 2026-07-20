import type { Locale } from "./routing"

interface SlugEntity {
  slug: string
}

type LocaleSlugFetcher<T extends SlugEntity> = (
  slug: string,
  locale: Locale,
) => Promise<T | null>

export async function resolveLegacySlug<T extends SlugEntity>(
  decodedSlug: string,
  fetchBySlug: LocaleSlugFetcher<T>,
): Promise<{ locale: Locale; slug: string } | null> {
  const [english, indonesian] = await Promise.all([
    fetchBySlug(decodedSlug, "en"),
    fetchBySlug(decodedSlug, "id"),
  ])

  if (english) return { locale: "en", slug: english.slug }
  if (indonesian) return { locale: "id", slug: indonesian.slug }
  return null
}
