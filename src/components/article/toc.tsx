"use client"

import { useEffect, useState } from "react"
import { useLang } from "@/contexts/lang-context"

interface Heading {
  text: string
  slug: string
  level: number
}

const labels = {
  en: "On this page",
  id: "Di halaman ini",
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("")
  const { lang } = useLang()

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    )

    headings.forEach((h) => {
      const el = document.getElementById(h.slug)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav
      aria-label="Table of contents"
      style={{
        position: "sticky",
        top: "2rem",
        fontSize: "13px",
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--text-subtle)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        {labels[lang]}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {headings.map((h) => {
          const isActive = activeId === h.slug
          return (
            <li
              key={h.slug}
              style={{
                marginBottom: "6px",
                paddingLeft: h.level === 3 ? "12px" : "0",
              }}
            >
              <a
                href={`#${h.slug}`}
                style={{
                  color: isActive ? "var(--text)" : "var(--text-subtle)",
                  textDecoration: "none",
                  display: "block",
                  padding: "4px 0",
                  borderLeft: isActive
                    ? "2px solid var(--text)"
                    : "2px solid transparent",
                  paddingLeft: "10px",
                  marginLeft: "-12px",
                  transition: "color 0.15s, border-color 0.15s",
                  fontWeight: isActive ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.color = "var(--text-muted)"
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.color = "var(--text-subtle)"
                }}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
