import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CodeSnippet } from "@/components/code-snippet"
import { AboutSection } from "@/components/home/about-section"
import { HomeAnimations } from "@/components/home/home-animations"
import { HomeFooter } from "@/components/home/home-footer"
import { Hero } from "@/components/home/hero"
import { LabSection } from "@/components/home/lab-section"
import { WorkSection } from "@/components/home/work-section"
import { JournalSection } from "@/components/journal-section"
import { SiteHeader } from "@/components/layout/site-header"
import { SocialLinks } from "@/components/social-links"
import { SectionLabel } from "@/components/ui/section-label"
import { buildPageAlternates } from "@/lib/i18n/metadata"
import { homePath, isLocale } from "@/lib/i18n/routing"
import {
  fetchArticles,
  fetchLandingPage,
  fetchProjects,
  fetchSocialLinks,
} from "@/lib/strapi"

export const revalidate = 60

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  return {
    alternates: buildPageAlternates({
      canonicalPath: homePath(candidate),
      languages: {
        en: homePath("en"),
        id: homePath("id"),
      },
    }),
  }
}

export default async function Home({ params }: HomePageProps) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()
  const locale = candidate

  const [landing, socialLinks, projects, articles] = await Promise.all([
    fetchLandingPage(locale),
    fetchSocialLinks(),
    fetchProjects(locale),
    fetchArticles(locale, { limit: 3 }),
  ])

  const selectedWork =
    locale === "id"
      ? {
          label: "Karya Pilihan",
          viewAll: "Lihat semua project →",
        }
      : {
          label: "Selected Work",
          viewAll: "View all projects →",
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

        <section style={{ marginBottom: "5rem" }}>
          <Hero data={landing} />
        </section>

        <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
          <AboutSection data={landing} />
        </section>

        <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
          <SectionLabel number="02" label={landing.sections.journal} />
          <JournalSection
            articles={articles}
            emptyState={landing.journalEmpty}
            locale={locale}
            viewAllLabel={landing.journalViewAll}
          />
        </section>

        {projects.length > 0 && (
          <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
            <SectionLabel number="03" label={selectedWork.label} />
            <WorkSection
              locale={locale}
              projects={projects}
              viewAllLabel={selectedWork.viewAll}
            />
          </section>
        )}

        <section data-animate="reveal" style={{ marginBottom: "5rem" }}>
          <LabSection data={landing} />
          <CodeSnippet />
        </section>

        <section data-animate="reveal" style={{ marginBottom: "4rem" }}>
          <SectionLabel number="05" label={landing.sections.connect} />
          <SocialLinks links={socialLinks} />
        </section>

        <div data-animate="reveal">
          <HomeFooter data={landing} />
        </div>
      </div>
    </main>
  )
}
