export function CodeSnippet() {
  return (
    <div
      className="dark"
      style={{
        borderRadius: "10px",
        border: "1px solid var(--hairline-soft)",
        background: "var(--surface-cool)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--hairline-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "11px",
          color: "var(--graphite)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ff5f57",
              }}
            />
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#febc2e",
              }}
            />
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#28c840",
              }}
            />
          </div>
          <span style={{ marginLeft: "8px" }}>summarize-journal.ts</span>
        </div>
        <span>TypeScript</span>
      </div>

      <pre
        style={{
          margin: 0,
          padding: "16px 20px",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "13px",
          lineHeight: "1.7",
          color: "var(--ink)",
          overflowX: "auto",
        }}
      >
        <div style={{ minHeight: "1.7em" }}>
          <span style={{ color: "var(--syntax-comment)", fontStyle: "italic" }}>
            {"// Summarize this week's journal entries"}
          </span>
        </div>
        <div style={{ minHeight: "1.7em" }}>
          <span style={{ color: "var(--syntax-key)" }}>const</span>
          {" summary = "}
          <span style={{ color: "var(--syntax-key)" }}>await</span>{" "}
          <span style={{ color: "var(--syntax-fn)" }}>anthropic</span>
          {".messages."}
          <span style={{ color: "var(--syntax-fn)" }}>create</span>
          {"({"}
        </div>
        <div style={{ minHeight: "1.7em", paddingLeft: "16px" }}>
          {"model: "}
          <span style={{ color: "var(--syntax-str)" }}>
            &quot;claude-opus-4-7&quot;
          </span>
          {","}
        </div>
        <div style={{ minHeight: "1.7em", paddingLeft: "16px" }}>
          {"max_tokens: "}
          <span style={{ color: "var(--syntax-num)" }}>1024</span>
          {","}
        </div>
        <div style={{ minHeight: "1.7em", paddingLeft: "16px" }}>
          {"messages: ["}
        </div>
        <div style={{ minHeight: "1.7em", paddingLeft: "32px" }}>
          {"{ role: "}
          <span style={{ color: "var(--syntax-str)" }}>&quot;user&quot;</span>
          {", content: entries },"}
        </div>
        <div style={{ minHeight: "1.7em", paddingLeft: "16px" }}>{"],"}</div>
        <div style={{ minHeight: "1.7em" }}>{"});"}</div>
        <div style={{ minHeight: "1.7em" }}>&nbsp;</div>
        <div style={{ minHeight: "1.7em" }}>
          <span style={{ color: "var(--syntax-comment)", fontStyle: "italic" }}>
            {"// → Weekly reflection, auto-drafted ✨"}
          </span>
        </div>
      </pre>
    </div>
  )
}
