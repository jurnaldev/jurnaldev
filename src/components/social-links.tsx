"use client"

import {
  Instagram,
  Linkedin,
  Github,
  Twitter,
  Mail,
  Rss,
  Link2,
  ArrowUpRight,
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
    <div>
      {links.map((link, i) => {
        const Icon = pickIcon(link)
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 0",
              borderBottom:
                i < links.length - 1 ? "1px solid var(--hairline)" : "none",
              color: "inherit",
              textDecoration: "none",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <div
              style={{ color: "var(--slate)", flexShrink: 0, display: "flex" }}
            >
              <Icon size={15} strokeWidth={1.75} />
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 400,
                color: "var(--ink)",
                flex: 1,
              }}
            >
              {link.name}
            </span>
            <div style={{ color: "var(--stone)", display: "flex" }}>
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </div>
          </a>
        )
      })}
    </div>
  )
}
