export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.2px",
        textTransform: "uppercase",
        padding: "3px 10px",
        border: "1px solid var(--hairline)",
        borderRadius: "9999px",
        color: "var(--slate)",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  )
}
