"use client"

import { useState } from "react"
import { Check, Link2, Twitter, Linkedin } from "lucide-react"
import { useLang } from "@/contexts/lang-context"

const labels = {
  en: { share: "Share", copied: "Copied!", copyLink: "Copy link" },
  id: { share: "Bagikan", copied: "Tersalin!", copyLink: "Salin tautan" },
}

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const { lang } = useLang()
  const l = labels[lang]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url,
  )}`

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 12px",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    background: "var(--bg-elevated)",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
    textDecoration: "none",
    transition: "all 0.15s ease",
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--text-subtle)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginRight: "4px",
        }}
      >
        {l.share} /
      </span>
      <button
        onClick={copyLink}
        aria-label={l.copyLink}
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text)"
          e.currentTarget.style.borderColor = "var(--border-hover)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)"
          e.currentTarget.style.borderColor = "var(--border)"
        }}
      >
        {copied ? (
          <Check size={12} strokeWidth={2} />
        ) : (
          <Link2 size={12} strokeWidth={2} />
        )}
        <span>{copied ? l.copied : l.copyLink}</span>
      </button>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter/X"
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text)"
          e.currentTarget.style.borderColor = "var(--border-hover)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)"
          e.currentTarget.style.borderColor = "var(--border)"
        }}
      >
        <Twitter size={12} strokeWidth={2} />
        <span>Twitter</span>
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text)"
          e.currentTarget.style.borderColor = "var(--border-hover)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)"
          e.currentTarget.style.borderColor = "var(--border)"
        }}
      >
        <Linkedin size={12} strokeWidth={2} />
        <span>LinkedIn</span>
      </a>
    </div>
  )
}
