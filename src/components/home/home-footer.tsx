import type { StrapiLandingPage } from "@/lib/strapi/types"

export function HomeFooter({ data }: { data: StrapiLandingPage }) {
  return (
    <footer
      style={{
        marginTop: "3rem",
        marginLeft: "-1.5rem",
        marginRight: "-1.5rem",
        padding: "1.5rem",
        background: "var(--footer-bg)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "11px",
        color: "var(--stone)",
        letterSpacing: "0.2px",
        textTransform: "uppercase",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <span>{data.footer}</span>
      <span>{data.built}</span>
    </footer>
  )
}
