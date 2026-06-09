import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { SectionLabel } from "@/components/ui/section-label"
import { MetaItem } from "@/components/ui/meta-item"
import type { StrapiLandingPage } from "@/lib/strapi/types"

export function AboutSection({ data }: { data: StrapiLandingPage }) {
  return (
    <>
      <SectionLabel number="01" label={data.sections.about} />

      <div style={{ maxWidth: "580px" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color: "var(--graphite)",
                  margin: "0 0 1.25rem 0",
                  letterSpacing: "-0.005em",
                }}
              >
                {children}
              </p>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                style={{ color: "var(--ink)", textDecoration: "underline" }}
              >
                {children}
              </a>
            ),
          }}
        >
          {data.about}
        </ReactMarkdown>
      </div>

      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <MetaItem label={data.currentlyLabel} value={data.currentlyValue} />
        <MetaItem label={data.stackLabel} value={data.stackValue} />
      </div>
    </>
  )
}
