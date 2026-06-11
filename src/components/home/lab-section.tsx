import { Sparkles } from "lucide-react"
import { SectionLabel } from "@/components/ui/section-label"
import type { StrapiLandingPage } from "@/lib/strapi/types"

export function LabSection({ data }: { data: StrapiLandingPage }) {
  return (
    <>
      <SectionLabel number="04" label={data.sections.lab} icon={Sparkles} />

      <p
        style={{
          fontSize: "14px",
          color: "var(--graphite)",
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
