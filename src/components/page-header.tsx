"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { LangToggle } from "./lang-toggle"
import { useLang } from "@/contexts/lang-context"

const nav = {
  en: { home: "Home", journal: "Journal" },
  id: { home: "Beranda", journal: "Jurnal" },
}

export function PageHeader() {
  const { lang } = useLang()

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "3rem",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "13px",
          letterSpacing: "-0.01em",
        }}
      >
        <Link
          href="/"
          style={{
            color: "var(--text-muted)",
            textDecoration: "none",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          jurnal<span style={{ color: "var(--text)" }}>.dev</span>
        </Link>
        <nav
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <Link
            href="/"
            style={{ color: "inherit", textDecoration: "none" }}
            className="nav-link"
          >
            {nav[lang].home}
          </Link>
          <Link
            href="/jurnal"
            style={{ color: "inherit", textDecoration: "none" }}
            className="nav-link"
          >
            {nav[lang].journal}
          </Link>
        </nav>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
