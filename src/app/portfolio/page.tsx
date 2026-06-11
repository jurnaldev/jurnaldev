import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/site-header"
import { LocaleGate } from "@/components/locale-gate"
import { FeaturedProject } from "@/components/portfolio/featured-project"
import { ProjectRow } from "@/components/portfolio/project-row"
import { fetchProjects } from "@/lib/strapi"
import type { StrapiProject } from "@/lib/strapi/types"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected projects by Fahmi Hidayat — backend services, AI experiments, and side projects.",
}

const copy = {
  en: {
    eyebrow: "Portfolio",
    title: "Selected work.",
    subtitle:
      "Projects I've built and shipped — production services, AI experiments, side projects.",
    empty: "No projects yet. Check back soon.",
    featuredLabel: "Featured",
    count: (n: number) => `${n} ${n === 1 ? "project" : "projects"}`,
  },
  id: {
    eyebrow: "Portofolio",
    title: "Karya pilihan.",
    subtitle:
      "Project yang gw bikin dan rilis — service production, eksperimen AI, side project.",
    empty: "Belum ada project. Cek lagi nanti ya.",
    featuredLabel: "Featured",
    count: (n: number) => `${n} project`,
  },
}

function splitProjects(projects: StrapiProject[]): {
  featured: StrapiProject | null
  rows: StrapiProject[]
} {
  const candidate = projects.find((p) => p.featured) ?? projects[0]
  if (candidate?.cover) {
    return {
      featured: candidate,
      rows: projects.filter((p) => p.id !== candidate.id),
    }
  }
  return { featured: null, rows: projects }
}

function ProjectList({
  projects,
  t,
}: {
  projects: StrapiProject[]
  t: (typeof copy)["en"]
}) {
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

      <div style={{ height: "1px", background: "var(--hairline)" }} />

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
            <div style={{ borderBottom: "1px solid var(--hairline)" }}>
              <FeaturedProject project={featured} label={t.featuredLabel} />
            </div>
          )}
          {rows.map((project, i) => (
            <div
              key={project.id}
              style={{
                borderBottom:
                  i < rows.length - 1 ? "1px solid var(--hairline)" : "none",
              }}
            >
              <ProjectRow project={project} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default async function PortfolioPage() {
  const [projectsEn, projectsId] = await Promise.all([
    fetchProjects("en"),
    fetchProjects("id"),
  ])

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
        <LocaleGate locale="en">
          <ProjectList projects={projectsEn} t={copy.en} />
        </LocaleGate>
        <LocaleGate locale="id">
          <ProjectList projects={projectsId} t={copy.id} />
        </LocaleGate>
      </div>
    </main>
  )
}
