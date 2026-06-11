import { SiteHeader } from "@/components/layout/site-header"
import { HomeAnimations } from "@/components/home/home-animations"
import { Hero } from "@/components/home/hero"
import { AboutSection } from "@/components/home/about-section"
import { LabSection } from "@/components/home/lab-section"
import { HomeFooter } from "@/components/home/home-footer"
import { JournalSection } from "@/components/journal-section"
import { SocialLinks } from "@/components/social-links"
import { SectionLabel } from "@/components/ui/section-label"
import { CodeSnippet } from "@/components/code-snippet"
import { LocaleGate } from "@/components/locale-gate"
import { WorkSection } from "@/components/home/work-section"
import { fetchLandingPage, fetchProjects, fetchSocialLinks } from "@/lib/strapi"

export const revalidate = 60

export default async function Home() {
  const [enLanding, idLanding, socialLinks, projectsEn, projectsId] =
    await Promise.all([
      fetchLandingPage("en"),
      fetchLandingPage("id"),
      fetchSocialLinks(),
      fetchProjects("en"),
      fetchProjects("id"),
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
    <main style={{ minHeight: "100dvh", position: "relative" }}>
      <HomeAnimations />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <SiteHeader marginBottom="4rem" />

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
        <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
          <LocaleGate locale="en">
            <AboutSection data={enLanding} />
          </LocaleGate>
          <LocaleGate locale="id">
            <AboutSection data={idLanding} />
          </LocaleGate>
        </section>

        {/* Journal */}
        <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
          <LocaleGate locale="en">
            <SectionLabel number="02" label={enLanding.sections.journal} />
          </LocaleGate>
          <LocaleGate locale="id">
            <SectionLabel number="02" label={idLanding.sections.journal} />
          </LocaleGate>
          <JournalSection emptyState={emptyState} viewAllLabel={viewAllLabel} />
        </section>

        {/* Selected Work */}
        {(projectsEn.length > 0 || projectsId.length > 0) && (
          <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
            <LocaleGate locale="en">
              <SectionLabel number="03" label="Selected Work" />
              <WorkSection
                projects={projectsEn}
                viewAllLabel="View all projects →"
              />
            </LocaleGate>
            <LocaleGate locale="id">
              <SectionLabel number="03" label="Karya Pilihan" />
              <WorkSection
                projects={projectsId}
                viewAllLabel="Lihat semua project →"
              />
            </LocaleGate>
          </section>
        )}

        {/* Lab */}
        <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
          <LocaleGate locale="en">
            <LabSection data={enLanding} />
          </LocaleGate>
          <LocaleGate locale="id">
            <LabSection data={idLanding} />
          </LocaleGate>
          <CodeSnippet />
        </section>

        {/* Connect */}
        <section data-animate="reveal" style={{ marginBottom: "4rem" }}>
          <LocaleGate locale="en">
            <SectionLabel number="05" label={enLanding.sections.connect} />
          </LocaleGate>
          <LocaleGate locale="id">
            <SectionLabel number="05" label={idLanding.sections.connect} />
          </LocaleGate>
          <SocialLinks links={socialLinks} />
        </section>

        <div data-animate="reveal">
          <LocaleGate locale="en">
            <HomeFooter data={enLanding} />
          </LocaleGate>
          <LocaleGate locale="id">
            <HomeFooter data={idLanding} />
          </LocaleGate>
        </div>
      </div>
    </main>
  )
}
