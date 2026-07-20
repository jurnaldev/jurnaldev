import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JournalList } from "@/components/journal-list"
import { buildPageAlternates } from "@/lib/i18n/metadata"
import { isLocale, journalPath } from "@/lib/i18n/routing"

interface JournalPageProps {
  params: Promise<{ locale: string }>
}

const metadataCopy = {
  en: {
    title: "Journal",
    description:
      "Notes from a backend engineer learning AI, building systems, and sharing the process.",
  },
  id: {
    title: "Jurnal",
    description:
      "Catatan seorang backend engineer yang belajar AI, membangun sistem, dan berbagi prosesnya.",
  },
}

export async function generateMetadata({
  params,
}: JournalPageProps): Promise<Metadata> {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  return {
    ...metadataCopy[candidate],
    alternates: buildPageAlternates({
      canonicalPath: journalPath(candidate),
      languages: {
        en: journalPath("en"),
        id: journalPath("id"),
      },
    }),
  }
}

export default async function JournalPage({ params }: JournalPageProps) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  return <JournalList locale={candidate} />
}
