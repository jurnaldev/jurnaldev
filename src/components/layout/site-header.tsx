"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { LangToggle } from "@/components/lang-toggle"
import { useLang } from "@/contexts/lang-context"

const nav = {
  en: { home: "Home", journal: "Journal" },
  id: { home: "Beranda", journal: "Jurnal" },
}

export function SiteHeader({ marginBottom = "3rem" }: { marginBottom?: string }) {
  const { lang } = useLang()
  const pathname = usePathname()

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid var(--hairline)",
        marginBottom,
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          fontSize: "14px",
        }}
      >
        <Link
          href="/"
          style={{
            color: "var(--ink)",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "-0.3px",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          jurnal.dev
        </Link>

        <nav style={{ display: "flex", gap: "16px" }}>
          {[
            { href: "/", label: nav[lang].home },
            { href: "/jurnal", label: nav[lang].journal },
          ].map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname?.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                style={{
                  color: active ? "var(--ink)" : "var(--slate)",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active ? "var(--ink)" : "var(--slate)")
                }
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
