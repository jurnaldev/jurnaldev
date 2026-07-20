import Link from "next/link"
import type { StrapiProject } from "@/lib/strapi/types"
import { ArticleBody } from "@/components/article/article-body"
import {
  ProjectMeta,
  type MetaLabels,
} from "@/components/portfolio/project-meta"
import { ProjectGallery } from "@/components/portfolio/project-gallery"
import { SiteHeader } from "@/components/layout/site-header"
import { LocaleGate } from "@/components/locale-gate"
import { strapiMediaUrl } from "@/lib/strapi"

interface Props {
  projectEn: StrapiProject | null
  projectId: StrapiProject | null
}

const copy: Record<
  "en" | "id",
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

function ProjectContent({
  project,
  body,
  t,
}: {
  project: StrapiProject
  body: React.ReactNode
  t: (typeof copy)["en"]
}) {
  const coverUrl = strapiMediaUrl(project.cover?.url)
  const number = String(project.order ?? 0).padStart(3, "0")

  return (
    <>
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
          href="/portfolio"
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
    </>
  )
}

function MissingLocaleNotice({ locale }: { locale: "en" | "id" }) {
  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        color: "var(--graphite)",
        border: "1px dashed var(--hairline)",
        margin: "2rem 0",
      }}
    >
      {locale === "id" ? (
        <>
          Versi Bahasa Indonesia belum tersedia. <br />
          <em style={{ color: "var(--stone)" }}>
            This project is only available in English.
          </em>
        </>
      ) : (
        <>
          English version not available yet. <br />
          <em style={{ color: "var(--stone)" }}>
            Project ini hanya tersedia dalam Bahasa Indonesia.
          </em>
        </>
      )}
    </div>
  )
}

export async function ProjectView({ projectEn, projectId }: Props) {
  const bodyEn = projectEn
    ? await ArticleBody({ body: projectEn.body, headingPrefix: "project-en" })
    : null
  const bodyId = projectId
    ? await ArticleBody({ body: projectId.body, headingPrefix: "project-id" })
    : null

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
        <SiteHeader />

        <article style={{ minWidth: 0 }}>
          {projectEn && (
            <LocaleGate locale="en">
              <ProjectContent project={projectEn} body={bodyEn} t={copy.en} />
            </LocaleGate>
          )}
          {projectId && (
            <LocaleGate locale="id">
              <ProjectContent project={projectId} body={bodyId} t={copy.id} />
            </LocaleGate>
          )}
          {projectEn && !projectId && (
            <LocaleGate locale="id">
              <MissingLocaleNotice locale="id" />
            </LocaleGate>
          )}
          {!projectEn && projectId && (
            <LocaleGate locale="en">
              <MissingLocaleNotice locale="en" />
            </LocaleGate>
          )}
        </article>
      </div>
    </main>
  )
}
