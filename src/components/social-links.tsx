import {
  Instagram,
  Linkedin,
  Github,
  Twitter,
  type LucideIcon,
} from "lucide-react"
import { socials } from "@/lib/content"

const iconMap: Record<string, LucideIcon> = {
  Instagram,
  LinkedIn: Linkedin,
  GitHub: Github,
  Twitter,
}

export function SocialLinks() {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {socials.map(({ name, href }) => {
        const Icon = iconMap[name]
        return (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
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
