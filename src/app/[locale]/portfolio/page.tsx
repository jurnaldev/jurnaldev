import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteHeader } from "@/components/layout/site-header"
import { FeaturedProject } from "@/components/portfolio/featured-project"
import { ProjectRow } from "@/components/portfolio/project-row"
import { buildPageAlternates } from "@/lib/i18n/metadata"
import { isLocale, portfolioPath, type Locale } from "@/lib/i18n/routing"
import { fetchProjects } from "@/lib/strapi"
import type { StrapiProject } from "@/lib/strapi/types"

export const revalidate = 60

interface PortfolioPageProps {
  params: Promise<{ locale: string }>
}

const copy = {
  en: {
    eyebrow: "Portfolio",
    title: "Selected work.",
    subtitle:
      "Projects I've built in the past and present. Everything you can read here, from production-ready, AI experiments, to side projects.",
    empty: "No projects yet. Check back soon.",
    featuredLabel: "Featured",
    count: (count: number) =>
      `${count} ${count === 1 ? "project" : "projects"}`,
  },
  id: {
    eyebrow: "Portofolio",
    title: "Karya pilihan.",
    subtitle:
      "Project yang pernah/sedang gue build. Semuanya kalian bisa baca disini, dari yang udah di production, eksperimen AI, sampai side project.",
    empty: "Belum ada project. Cek lagi nanti ya.",
    featuredLabel: "Featured",
    count: (count: number) => `${count} project`,
  },
}

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  return {
    title: candidate === "id" ? "Portofolio" : "Portfolio",
    description: copy[candidate].subtitle,
    alternates: buildPageAlternates({
      canonicalPath: portfolioPath(candidate),
      languages: {
        en: portfolioPath("en"),
        id: portfolioPath("id"),
      },
    }),
  }
}

function splitProjects(projects: StrapiProject[]): {
  featured: StrapiProject | null
  rows: StrapiProject[]
} {
  const candidate = projects.find((project) => project.featured) ?? projects[0]
  if (candidate?.cover) {
    return {
      featured: candidate,
      rows: projects.filter((project) => project.id !== candidate.id),
    }
  }
  return { featured: null, rows: projects }
}

function ProjectList({
  locale,
  projects,
}: {
  locale: Locale
  projects: StrapiProject[]
}) {
  const t = copy[locale]
  const { featured, rows } = splitProjects(projects)

  return (
    <>
      <section style={{ marginBottom: "3rem" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--slate)",
            letterSpacing: "0.35px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {t.eyebrow}
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 400,
            letterSpacing: "-1px",
            lineHeight: 1.05,
            margin: "0 0 0.75rem 0",
            color: "var(--ink)",
          }}
        >
          {t.title}
        </h1>
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.5,
            color: "var(--graphite)",
            margin: 0,
            maxWidth: "540px",
          }}
        >
          {t.subtitle}
        </p>
      </section>

      {projects.length > 0 && (
        <div
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "var(--stone)",
            letterSpacing: "0.2px",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          {t.count(projects.length)}
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ height: "1px", background: "var(--hairline)" }} />
      )}

      {projects.length === 0 ? (
        <div
          style={{
            padding: "3rem 1.5rem",
            textAlign: "center",
            color: "var(--graphite)",
            border: "1px solid var(--hairline)",
            marginTop: "1rem",
          }}
        >
          {t.empty}
        </div>
      ) : (
        <div>
          {featured && (
            <div
              style={{
                borderBottom:
                  rows.length > 0 ? "1px solid var(--hairline)" : "none",
              }}
            >
              <FeaturedProject
                label={t.featuredLabel}
                locale={locale}
                project={featured}
              />
            </div>
          )}
          {rows.map((project, index) => (
            <div
              key={project.id}
              style={{
                borderBottom:
                  index < rows.length - 1
                    ? "1px solid var(--hairline)"
                    : "none",
              }}
            >
              <ProjectRow locale={locale} project={project} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  const projects = await fetchProjects(candidate)

  return (
    <main
      className="page-enter"
      style={{ minHeight: "100dvh", position: "relative" }}
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
        <ProjectList locale={candidate} projects={projects} />
      </div>
    </main>
  )
}
