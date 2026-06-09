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
          color: "var(--slate)",
          letterSpacing: "0.35px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {number}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--hairline)" }} />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--slate)",
          letterSpacing: "0.35px",
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
