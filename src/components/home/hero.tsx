import { Avatar } from "@/components/avatar"
import { strapiMediaUrl } from "@/lib/strapi"
import type { StrapiLandingPage } from "@/lib/strapi/types"

export function Hero({ data }: { data: StrapiLandingPage }) {
  return (
    <>
      <div
        data-animate="avatar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "2rem",
        }}
      >
        <Avatar
          src={strapiMediaUrl(data.avatar?.url)}
          alt={data.avatar?.alternativeText ?? data.displayName}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--stone)",
              letterSpacing: "0.2px",
              textTransform: "uppercase",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {data.statusDot && (
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
                }}
              />
            )}
            {data.location.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--stone)",
              letterSpacing: "0.2px",
            }}
          >
            {data.handle}
          </div>
        </div>
      </div>

      <h1
        data-animate="hero-line"
        style={{
          fontSize: "clamp(2.75rem, 7vw, 4.5rem)",
          fontWeight: 400,
          letterSpacing: "-1.2px",
          lineHeight: 1.0,
          margin: "0 0 1.5rem 0",
          color: "var(--ink)",
        }}
      >
        {data.displayName}
      </h1>

      <p
        data-animate="hero-line"
        style={{
          fontSize: "1.25rem",
          fontWeight: 400,
          letterSpacing: "0",
          lineHeight: 1.5,
          color: "var(--graphite)",
          margin: 0,
          maxWidth: "520px",
        }}
      >
        {data.role} <span style={{ color: "var(--stone)" }}>|</span>{" "}
        <span style={{ color: "var(--ink)" }}>{data.tagline}</span>
      </p>
    </>
  )
}
