"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { LangToggle } from "@/components/lang-toggle"
import { useLang } from "@/contexts/lang-context"
import { homePath, journalPath, portfolioPath } from "@/lib/i18n/routing"

const nav = {
  en: { home: "Home", journal: "Journal", portfolio: "Portfolio" },
  id: { home: "Beranda", journal: "Jurnal", portfolio: "Portofolio" },
}

export function SiteHeader({
  marginBottom = "3rem",
  alternateHref,
}: {
  marginBottom?: string
  alternateHref?: string | null
}) {
  const { lang } = useLang()
  const pathname = usePathname()
  const localizedHomePath = homePath(lang)

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
          href={localizedHomePath}
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
            { href: localizedHomePath, label: nav[lang].home },
            { href: journalPath(lang), label: nav[lang].journal },
            { href: portfolioPath(lang), label: nav[lang].portfolio },
          ].map(({ href, label }) => {
            const active =
              href === localizedHomePath
                ? pathname === localizedHomePath
                : pathname === href || pathname?.startsWith(`${href}/`)
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--ink)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active
                    ? "var(--ink)"
                    : "var(--slate)")
                }
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <LangToggle alternateHref={alternateHref} />
        <ThemeToggle />
      </div>
    </header>
  )
}
