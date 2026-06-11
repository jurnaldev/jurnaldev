import { ArrowUpRight } from "lucide-react"
import type { StrapiProject } from "@/lib/strapi/types"
import { STATUS_LABEL } from "./status-label"

export interface MetaLabels {
  year: string
  status: string
  stack: string
  links: string
}

function MetaRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "16px",
        padding: "8px 0",
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--stone)",
          letterSpacing: "0.35px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          color: "var(--ink)",
          textAlign: "right",
        }}
      >
        {children}
      </span>
    </div>
  )
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "var(--ink)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        borderBottom: "1px solid var(--hairline-soft)",
      }}
    >
      {label}
      <ArrowUpRight size={12} strokeWidth={2} />
    </a>
  )
}

export function ProjectMeta({
  project,
  labels,
}: {
  project: StrapiProject
  labels: MetaLabels
}) {
  const hasLinks = Boolean(project.githubUrl || project.demoUrl)

  return (
    <div style={{ borderBottom: "1px solid var(--hairline)" }}>
      <MetaRow label={labels.year}>{project.year}</MetaRow>
      <MetaRow label={labels.status}>{STATUS_LABEL[project.status]}</MetaRow>
      {project.stack.length > 0 && (
        <MetaRow label={labels.stack}>{project.stack.join(" · ")}</MetaRow>
      )}
      {hasLinks && (
        <MetaRow label={labels.links}>
          <span
            style={{
              display: "inline-flex",
              gap: "14px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {project.githubUrl && (
              <ExternalLink href={project.githubUrl} label="GitHub" />
            )}
            {project.demoUrl && (
              <ExternalLink href={project.demoUrl} label="Demo" />
            )}
          </span>
        </MetaRow>
      )}
    </div>
  )
}
