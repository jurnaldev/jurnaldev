import Link from "next/link"
import type { StrapiProject } from "@/lib/strapi/types"
import { strapiMediaUrl } from "@/lib/strapi"
import { Tag } from "@/components/ui/tag"

export function FeaturedProject({
  project,
  label,
}: {
  project: StrapiProject
  label: string
}) {
  const coverUrl = strapiMediaUrl(project.cover?.url)
  const number = String(project.order ?? 0).padStart(3, "0")

  return (
    <Link href={`/portfolio/${project.slug}`} className="featured-project">
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={project.cover?.alternativeText || project.title}
          style={{
            width: "100%",
            aspectRatio: "16 / 10",
            objectFit: "cover",
            display: "block",
            background: "var(--hairline)",
          }}
        />
      )}
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "var(--stone)",
            letterSpacing: "0.2px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {label} · {number}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "1.35rem",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.4px",
            lineHeight: 1.15,
          }}
        >
          {project.title}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "14px",
            color: "var(--graphite)",
            margin: "8px 0 12px",
            lineHeight: 1.55,
          }}
        >
          {project.excerpt}
        </span>
        <span style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {project.stack.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </span>
      </span>
    </Link>
  )
}
