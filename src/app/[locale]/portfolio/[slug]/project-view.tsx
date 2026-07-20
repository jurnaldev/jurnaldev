import Link from "next/link"

import { ArticleBody } from "@/components/article/article-body"
import { SiteHeader } from "@/components/layout/site-header"
import { ProjectGallery } from "@/components/portfolio/project-gallery"
import {
  ProjectMeta,
  type MetaLabels,
} from "@/components/portfolio/project-meta"
import { portfolioPath, type Locale } from "@/lib/i18n/routing"
import { strapiMediaUrl } from "@/lib/strapi"
import type { StrapiProject } from "@/lib/strapi/types"

interface Props {
  project: StrapiProject
  locale: Locale
  alternateHref: string | null
}

const copy: Record<
  Locale,
  { label: string; back: string; meta: MetaLabels }
> = {
  en: {
    label: "Project",
    back: "← All projects",
    meta: { year: "Year", status: "Status", stack: "Stack", links: "Links" },
  },
  id: {
    label: "Project",
    back: "← Semua project",
    meta: { year: "Tahun", status: "Status", stack: "Stack", links: "Tautan" },
  },
}

export async function ProjectView({
  project,
  locale,
  alternateHref,
}: Props) {
  const body = await ArticleBody({
    body: project.body,
    headingPrefix: `project-${locale}`,
  })
  const t = copy[locale]
  const coverUrl = strapiMediaUrl(project.cover?.url)
  const number = String(project.order ?? 0).padStart(3, "0")

  return (
    <main
      className="page-enter"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <SiteHeader alternateHref={alternateHref} />

        <article style={{ minWidth: 0 }}>
          <header className="project-header">
            <div>
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "11px",
                  color: "var(--stone)",
                  letterSpacing: "0.2px",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                {t.label} · {number}
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.9px",
                  lineHeight: 1.05,
                  margin: "0 0 0.75rem 0",
                  color: "var(--ink)",
                }}
              >
                {project.title}
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.55,
                  color: "var(--graphite)",
                  margin: "0 0 1.5rem 0",
                }}
              >
                {project.excerpt}
              </p>
              <ProjectMeta project={project} labels={t.meta} />
            </div>
            {coverUrl && (
              <div className="project-header-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt={project.cover?.alternativeText || project.title}
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    display: "block",
                    background: "var(--hairline)",
                  }}
                />
              </div>
            )}
          </header>

          {body}

          <ProjectGallery images={project.gallery ?? []} />

          <div
            style={{
              borderTop: "1px solid var(--hairline)",
              marginTop: "3rem",
              paddingTop: "1.5rem",
            }}
          >
            <Link
              href={portfolioPath(locale)}
              style={{
                fontSize: "14px",
                color: "var(--slate)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {t.back}
            </Link>
          </div>
        </article>
      </div>
    </main>
  )
}
