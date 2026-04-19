"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* noop */
    }
  }

  return (
    <button
      onClick={onCopy}
      aria-label="Copy code"
      style={{
        background: "transparent",
        border: "none",
        color: "var(--text-subtle)",
        cursor: "pointer",
        padding: "2px 4px",
        display: "flex",
        alignItems: "center",
        transition: "color 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-subtle)")}
    >
      {copied ? (
        <Check
          size={12}
          strokeWidth={2.5}
          style={{ color: "var(--syntax-str)" }}
        />
      ) : (
        <Copy size={12} strokeWidth={2} />
      )}
    </button>
  )
}
