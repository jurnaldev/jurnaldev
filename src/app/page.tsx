import { Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ThemeToggle } from "@/components/theme-toggle"
import { LangToggle } from "@/components/lang-toggle"
import { Avatar } from "@/components/avatar"
import { SectionLabel, MetaItem } from "@/components/primitives"
import { CodeSnippet } from "@/components/code-snippet"
import { JournalSection } from "@/components/journal-section"
import { SocialLinks } from "@/components/social-links"
import { LocaleGate } from "@/components/locale-gate"
import { fetchLandingPage, fetchSocialLinks } from "@/lib/strapi"
import type { StrapiLandingPage } from "@/lib/strapi/types"

export const revalidate = 60

export default async function Home() {
  const [enLanding, idLanding, socialLinks] = await Promise.all([
    fetchLandingPage("en"),
    fetchLandingPage("id"),
    fetchSocialLinks(),
  ])

  const emptyState = {
    en: enLanding.journalEmpty,
    id: idLanding.journalEmpty,
  }
  const viewAllLabel = {
    en: enLanding.journalViewAll,
    id: idLanding.journalViewAll,
  }

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
          <LocaleGate locale="en">
            <Hero data={enLanding} />
          </LocaleGate>
          <LocaleGate locale="id">
            <Hero data={idLanding} />
          </LocaleGate>
        </section>

        {/* About */}
        <section style={{ marginBottom: "5rem" }}>
          <LocaleGate locale="en">
            <About data={enLanding} />
          </LocaleGate>
          <LocaleGate locale="id">
            <About data={idLanding} />
          </LocaleGate>
        </section>

        {/* Journal */}
        <section style={{ marginBottom: "5rem" }}>
          <LocaleGate locale="en">
            <SectionLabel number="02" label={enLanding.sections.journal} />
          </LocaleGate>
          <LocaleGate locale="id">
            <SectionLabel number="02" label={idLanding.sections.journal} />
          </LocaleGate>
          <JournalSection
            emptyState={emptyState}
            viewAllLabel={viewAllLabel}
          />
        </section>

        {/* Lab */}
        <section style={{ marginBottom: "5rem" }}>
          <LocaleGate locale="en">
            <Lab data={enLanding} />
          </LocaleGate>
          <LocaleGate locale="id">
            <Lab data={idLanding} />
          </LocaleGate>
          <CodeSnippet />
        </section>

        {/* Connect */}
        <section style={{ marginBottom: "4rem" }}>
          <LocaleGate locale="en">
            <SectionLabel number="04" label={enLanding.sections.connect} />
          </LocaleGate>
          <LocaleGate locale="id">
            <SectionLabel number="04" label={idLanding.sections.connect} />
          </LocaleGate>
          <SocialLinks links={socialLinks} />
        </section>

        <LocaleGate locale="en">
          <Footer data={enLanding} />
        </LocaleGate>
        <LocaleGate locale="id">
          <Footer data={idLanding} />
        </LocaleGate>
      </div>
    </main>
  )
}

function Hero({ data }: { data: StrapiLandingPage }) {
  return (
    <>
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
              color: "var(--text-subtle)",
              letterSpacing: "0.05em",
            }}
          >
            {data.handle}
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
        {data.displayName}
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
        {data.role} <span style={{ color: "var(--text-subtle)" }}>—</span>{" "}
        <span style={{ color: "var(--text)" }}>{data.tagline}</span>
      </p>
    </>
  )
}

function About({ data }: { data: StrapiLandingPage }) {
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
                  color: "var(--text)",
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
                style={{ color: "var(--text)", textDecoration: "underline" }}
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
          gap: "1.5rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
        }}
      >
        <MetaItem label={data.currentlyLabel} value={data.currentlyValue} />
        <MetaItem label={data.stackLabel} value={data.stackValue} />
      </div>
    </>
  )
}

function Lab({ data }: { data: StrapiLandingPage }) {
  return (
    <>
      <SectionLabel number="03" label={data.sections.lab} icon={Sparkles} />

      <p
        style={{
          fontSize: "14px",
          color: "var(--text-muted)",
          margin: "0 0 1rem 0",
          lineHeight: 1.6,
          maxWidth: "560px",
        }}
      >
        {data.labCaption}
      </p>
    </>
  )
}

function Footer({ data }: { data: StrapiLandingPage }) {
  return (
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
      <span>{data.footer}</span>
      <span>{data.built}</span>
    </footer>
  )
}
