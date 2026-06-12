import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { fetchProjectBySlug, strapiMediaUrl } from "@/lib/strapi"
import { ProjectView } from "./project-view"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project =
    (await fetchProjectBySlug(slug, "en")) ||
    (await fetchProjectBySlug(slug, "id"))

  if (!project) {
    return { title: "Not found · jurnal.dev" }
  }

  const ogImage = strapiMediaUrl(project.cover?.url)

  return {
    title: project.title,
    description: project.excerpt,
    openGraph: {
      title: project.title,
      description: project.excerpt,
      type: "website",
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
  const { slug } = await params

  const [projectEn, projectId] = await Promise.all([
    fetchProjectBySlug(slug, "en"),
    fetchProjectBySlug(slug, "id"),
  ])

  let resolvedEn = projectEn
  let resolvedId = projectId

  if (!resolvedEn && resolvedId?.localizations?.length) {
    const enLoc = resolvedId.localizations.find((l) => l.locale === "en")
    if (enLoc) resolvedEn = await fetchProjectBySlug(enLoc.slug, "en")
  }
  if (!resolvedId && resolvedEn?.localizations?.length) {
    const idLoc = resolvedEn.localizations.find((l) => l.locale === "id")
    if (idLoc) resolvedId = await fetchProjectBySlug(idLoc.slug, "id")
  }

  if (!resolvedEn && !resolvedId) notFound()

  return <ProjectView projectEn={resolvedEn} projectId={resolvedId} />
}

// ISR: revalidate every 60s
export const revalidate = 60
