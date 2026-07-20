import Link from "next/link"
import type { StrapiProject } from "@/lib/strapi/types"
import { projectPath, type Locale } from "@/lib/i18n/routing"
import { STATUS_LABEL } from "./status-label"

export function ProjectRow({
  project,
  locale,
}: {
  project: StrapiProject
  locale: Locale
}) {
  const number = String(project.order ?? 0).padStart(3, "0")

  return (
    <Link href={projectPath(locale, project.slug)} className="project-row">
      <span
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "11px",
          color: "var(--stone)",
          letterSpacing: "0.2px",
          flexShrink: 0,
        }}
      >
        {number}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.2px",
          }}
        >
          {project.title}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "13px",
            color: "var(--graphite)",
            marginTop: "2px",
            lineHeight: 1.5,
          }}
        >
          {project.excerpt}
        </span>
      </span>
      <span
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "11px",
          color: "var(--stone)",
          letterSpacing: "0.2px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {project.year} · {STATUS_LABEL[project.status]}
      </span>
    </Link>
  )
}
