"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/contexts/theme-context"

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string>("")
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          fontFamily: "var(--font-geist-mono), monospace",
          themeVariables: {
            background: resolvedTheme === "dark" ? "#0d0d0d" : "#f5f5f0",
          },
        })
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
        const { svg: rendered } = await mermaid.render(id, chart)
        if (mounted) setSvg(rendered)
      } catch (err) {
        if (mounted)
          setError(err instanceof Error ? err.message : "Render error")
      }
    })()
    return () => {
      mounted = false
    }
  }, [chart, resolvedTheme])

  if (error) {
    return (
      <div
        style={{
          background: "var(--code-bg)",
          border: "1px solid var(--code-border)",
          borderRadius: "8px",
          padding: "1rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "13px",
        }}
      >
        Mermaid render error: {error}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      style={{
        background: "var(--code-bg)",
        border: "1px solid var(--code-border)",
        borderRadius: "8px",
        padding: "1.5rem",
        margin: "1.5rem 0",
        textAlign: "center",
        overflow: "auto",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
