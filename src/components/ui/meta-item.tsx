export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 500,
          color: "var(--stone)",
          letterSpacing: "0.2px",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "var(--ink)", lineHeight: "1.5" }}>
        {value}
      </div>
    </div>
  )
}
