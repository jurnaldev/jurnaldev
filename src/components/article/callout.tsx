import { Info, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react"
import type { ReactNode } from "react"

type CalloutType = "info" | "warning" | "tip" | "success"

const configs: Record<
  CalloutType,
  { icon: typeof Info; borderColor: string; bgColor: string; iconColor: string }
> = {
  info: {
    icon: Info,
    borderColor: "var(--syntax-fn)",
    bgColor: "rgba(37, 99, 235, 0.08)",
    iconColor: "var(--syntax-fn)",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "var(--syntax-num)",
    bgColor: "rgba(217, 119, 6, 0.08)",
    iconColor: "var(--syntax-num)",
  },
  tip: {
    icon: Lightbulb,
    borderColor: "var(--syntax-key)",
    bgColor: "rgba(124, 58, 237, 0.08)",
    iconColor: "var(--syntax-key)",
  },
  success: {
    icon: CheckCircle2,
    borderColor: "var(--syntax-str)",
    bgColor: "rgba(5, 150, 105, 0.08)",
    iconColor: "var(--syntax-str)",
  },
}

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType
  children: ReactNode
}) {
  const config = configs[type]
  const Icon = config.icon

  return (
    <div
      style={{
        borderLeft: `3px solid ${config.borderColor}`,
        background: config.bgColor,
        borderRadius: "6px",
        padding: "14px 18px",
        margin: "1.5rem 0",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <div style={{ paddingTop: "3px" }}>
        <Icon
          size={18}
          strokeWidth={2}
          style={{ color: config.iconColor, flexShrink: 0, marginTop: "2px" }}
        />
      </div>
      <div style={{ flex: 1, fontSize: "14px", lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  )
}
