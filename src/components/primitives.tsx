import type { LucideIcon } from "lucide-react"

export function SectionLabel({
  number,
  label,
  icon: Icon,
}: {
  number: string
  label: string
  icon?: LucideIcon
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-geist-mono), monospace",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "1.5rem",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--text-subtle)",
          letterSpacing: "0.3px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {number}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--text-subtle)",
          letterSpacing: "0.3px",
          textTransform: "uppercase",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {label}
        {Icon && <Icon size={11} strokeWidth={2} />}
      </span>
    </div>
  )
}

export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        borderRadius: "8px",
        padding: "10px 12px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--text-subtle)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{ fontSize: "14px", color: "var(--text)", lineHeight: "1.5" }}
      >
        {value}
      </div>
    </div>
  )
}
