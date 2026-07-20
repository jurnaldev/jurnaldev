import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { buildPageAlternates, openGraphLocaleSet } from "@/lib/i18n/metadata"
import { isLocale, projectPath, type Locale } from "@/lib/i18n/routing"
import { projectUrl } from "@/lib/site"
import { fetchProjectBySlug, strapiMediaUrl } from "@/lib/strapi"
import type { StrapiProject } from "@/lib/strapi/types"

import { ProjectView } from "./project-view"

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

function projectLanguages(project: StrapiProject) {
  const languages: Partial<Record<Locale, string>> = {
    [project.locale]: projectPath(project.locale, project.slug),
  }

  for (const localization of project.localizations ?? []) {
    languages[localization.locale] = projectPath(
      localization.locale,
      localization.slug,
    )
  }

  return languages
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: candidate, slug } = await params
  if (!isLocale(candidate)) notFound()

  const project = await fetchProjectBySlug(slug, candidate)
  if (!project) notFound()

  const ogImage = strapiMediaUrl(project.cover?.url)
  const languages = projectLanguages(project)
  const availableLocales = Object.keys(languages) as Locale[]
  const url = projectUrl(candidate, project.slug)

  return {
    title: project.title,
    description: project.excerpt,
    alternates: buildPageAlternates({
      canonicalPath: projectPath(candidate, project.slug),
      languages,
    }),
    openGraph: {
      title: project.title,
      description: project.excerpt,
      type: "website",
      ...openGraphLocaleSet(candidate, availableLocales),
      url,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale: candidate, slug } = await params
  if (!isLocale(candidate)) notFound()

  const project = await fetchProjectBySlug(slug, candidate)
  if (!project) notFound()

  const alternateLocale = candidate === "en" ? "id" : "en"
  const alternate = project.localizations?.find(
    (localization) => localization.locale === alternateLocale,
  )
  const alternateHref = alternate
    ? projectPath(alternate.locale, alternate.slug)
    : null

  return (
    <ProjectView
      project={project}
      locale={candidate}
      alternateHref={alternateHref}
    />
  )
}

export const revalidate = 60
export const dynamic = "force-static"
