"use client"

import { Sparkles } from "lucide-react"
import { useLang } from "@/contexts/lang-context"
import { content } from "@/lib/content"
import { ThemeToggle } from "@/components/theme-toggle"
import { LangToggle } from "@/components/lang-toggle"
import { Avatar } from "@/components/avatar"
import { SectionLabel, MetaItem } from "@/components/primitives"
import { CodeSnippet } from "@/components/code-snippet"
import { JournalSection } from "@/components/journal-section"
import { SocialLinks } from "@/components/social-links"

export default function Home() {
  const { lang } = useLang()
  const t = content[lang]

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div className="grid-overlay" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "4rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "13px",
              letterSpacing: "-0.01em",
              color: "var(--text-muted)",
            }}
          >
            jurnal<span style={{ color: "var(--text)" }}>.dev</span>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <LangToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Hero */}
        <section style={{ marginBottom: "5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "2rem",
            }}
          >
            <Avatar />

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "12px",
                  color: "var(--text-subtle)",
                  letterSpacing: "0.05em",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
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
                {t.location.toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "11px",
                  color: "var(--text-subtle)",
                  letterSpacing: "0.05em",
                }}
              >
                FAHMI HIDAYAT · @JURNAL.DEV
              </div>
            </div>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.75rem, 7vw, 4.5rem)",
              fontWeight: 500,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              margin: "0 0 1.5rem 0",
              color: "var(--text)",
            }}
          >
            Fahmi.
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              lineHeight: 1.4,
              color: "var(--text-muted)",
              margin: 0,
              maxWidth: "520px",
            }}
          >
            {t.role} <span style={{ color: "var(--text-subtle)" }}>—</span>{" "}
            <span style={{ color: "var(--text)" }}>{t.tagline}</span>
          </p>
        </section>

        {/* About */}
        <section style={{ marginBottom: "5rem" }}>
          <SectionLabel number="01" label={t.sections.about} />

          <div style={{ maxWidth: "580px" }}>
            {t.about.map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color: "var(--text)",
                  margin: "0 0 1.25rem 0",
                  letterSpacing: "-0.005em",
                }}
              >
                {para}
              </p>
            ))}
          </div>

          <div
            style={{
              marginTop: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              borderTop: "1px solid var(--border)",
              paddingTop: "1.5rem",
            }}
          >
            <MetaItem label={t.currentlyLabel} value={t.currentlyValue} />
            <MetaItem label={t.stackLabel} value={t.stackValue} />
          </div>
        </section>

        {/* Journal */}
        <section style={{ marginBottom: "5rem" }}>
          <SectionLabel number="02" label={t.sections.journal} />
          <JournalSection />
        </section>

        {/* Lab */}
        <section style={{ marginBottom: "5rem" }}>
          <SectionLabel number="03" label={t.sections.lab} icon={Sparkles} />

          <p
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              margin: "0 0 1rem 0",
              lineHeight: 1.6,
              maxWidth: "560px",
            }}
          >
            {t.labCaption}
          </p>

          <CodeSnippet />
        </section>

        {/* Connect */}
        <section style={{ marginBottom: "4rem" }}>
          <SectionLabel number="04" label={t.sections.connect} />
          <SocialLinks />
        </section>

        <footer
          style={{
            paddingTop: "3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--border)",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "var(--text-subtle)",
            letterSpacing: "0.02em",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span>{t.footer}</span>
          <span>{t.built}</span>
        </footer>
      </div>
    </main>
  )
}
