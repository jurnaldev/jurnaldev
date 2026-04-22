"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import Giscus from "@giscus/react"

import { useTheme } from "@/contexts/theme-context"
import { useLang } from "@/contexts/lang-context"

const labels = {
  en: { comments: "Discussion" },
  id: { comments: "Diskusi" },
}

export function GiscusComments({ slug }: { slug: string }) {
  const { resolvedTheme } = useTheme()
  const { lang } = useLang()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

  // Gracefully degrade if env vars are missing
  if (!mounted || !repo || !repoId || !category || !categoryId) {
    return null
  }

  const l = labels[lang]

  // Custom themes hosted at /public — Giscus fetches these by URL
  const themeUrl =
    resolvedTheme === "dark"
      ? "https://jurnal.dev/giscus-theme-dark.css"
      : "https://jurnal.dev/giscus-theme-light.css"

  return (
    <div
      style={{
        marginTop: "2.5rem",
        paddingTop: "2rem",
        borderTop: "1px solid var(--border)",
      }}
    >
      {/* Section label — matches jurnal.dev article-page label pattern */}
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--text-subtle)",
          letterSpacing: "0.1em",
          marginBottom: "1.5rem",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <MessageCircle size={11} strokeWidth={2} />
        <span>{l.comments} /</span>
      </div>
      <Giscus
        id="comments"
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="specific"
        term={slug}
        reactionsEnabled="0"
        emitMetadata="0"
        inputPosition="top"
        theme={themeUrl}
        lang={lang}
        loading="lazy"
      />
    </div>
  )
}
