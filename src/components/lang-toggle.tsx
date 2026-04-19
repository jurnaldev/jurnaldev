"use client"

import { useLang, type Lang } from "@/contexts/lang-context"

const options: Lang[] = ["en", "id"]

export function LangToggle() {
  const { lang, setLang } = useLang()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        overflow: "hidden",
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: "11px",
      }}
    >
      {options.map((l) => {
        const isActive = lang === l
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-label={`Switch to ${l === "en" ? "English" : "Bahasa Indonesia"}`}
            aria-pressed={isActive}
            style={{
              padding: "6px 10px",
              background: isActive ? "var(--text)" : "transparent",
              color: isActive ? "var(--bg)" : "var(--text-muted)",
              border: "none",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
