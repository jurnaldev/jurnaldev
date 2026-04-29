import {
  Instagram,
  Linkedin,
  Github,
  Twitter,
  Mail,
  Rss,
  Link2,
  type LucideIcon,
} from "lucide-react"
import type { StrapiSocialLink, SocialIcon } from "@/lib/strapi/types"

const iconMap: Record<SocialIcon, LucideIcon> = {
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  email: Mail,
  rss: Rss,
}

function pickIcon(link: StrapiSocialLink): LucideIcon {
  if (link.icon && iconMap[link.icon]) return iconMap[link.icon]
  const byName = link.name.toLowerCase() as SocialIcon
  if (iconMap[byName]) return iconMap[byName]
  return Link2
}

export function SocialLinks({ links }: { links: StrapiSocialLink[] }) {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {links.map((link) => {
        const Icon = pickIcon(link)
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className="social-link"
            style={{
              width: "44px",
              height: "44px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "all 0.15s ease",
              background: "var(--bg-elevated)",
            }}
          >
            <Icon size={18} strokeWidth={1.75} />
          </a>
        )
      })}
    </div>
  )
}
