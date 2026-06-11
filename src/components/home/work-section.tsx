import Link from "next/link"
import type { StrapiProject } from "@/lib/strapi/types"
import { ProjectRow } from "@/components/portfolio/project-row"

function topProjects(projects: StrapiProject[], n = 3): StrapiProject[] {
  return [...projects]
    .sort((a, b) => {
      const byFeatured = Number(b.featured ?? false) - Number(a.featured ?? false)
      if (byFeatured !== 0) return byFeatured
      return (a.order ?? 0) - (b.order ?? 0)
    })
    .slice(0, n)
}

export function WorkSection({
  projects,
  viewAllLabel,
}: {
  projects: StrapiProject[]
  viewAllLabel: string
}) {
  const top = topProjects(projects)

  return (
    <>
      <div>
        {top.map((project, i) => (
          <div
            key={project.id}
            style={{
              borderBottom:
                i < top.length - 1 ? "1px solid var(--hairline)" : "none",
            }}
          >
            <ProjectRow project={project} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Link
          href="/portfolio"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--slate)",
            textDecoration: "none",
          }}
        >
          {viewAllLabel}
        </Link>
      </div>
    </>
  )
}
