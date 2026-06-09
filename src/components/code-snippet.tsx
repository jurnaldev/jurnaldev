export function CodeSnippet() {
  const L = "1.7em"
  const s = (color: string) => ({ color: `var(${color})` })
  const comment = { ...s("--syntax-comment"), fontStyle: "italic" as const }

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
          <span style={{ marginLeft: "8px" }}>classify.go</span>
        </div>
        <span>Go</span>
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
        <div style={{ minHeight: L }}>
          <span style={comment}>{"// Classify article tags in Go"}</span>
        </div>
        <div style={{ minHeight: L }}>
          {"resp, err := client.Messages."}
          <span style={s("--syntax-fn")}>{"New"}</span>
          {"(ctx,"}
        </div>
        <div style={{ minHeight: L, paddingLeft: "16px" }}>
          <span style={s("--syntax-fn")}>{"anthropic"}</span>
          {"."}
          <span style={s("--syntax-fn")}>{"MessageNewParams"}</span>
          {"{"}
        </div>
        <div style={{ minHeight: L, paddingLeft: "32px" }}>
          {"Model:     "}
          <span style={s("--syntax-fn")}>{"anthropic"}</span>
          {"."}
          <span style={s("--syntax-str")}>{"ModelClaudeFable5"}</span>
          {","}
        </div>
        <div style={{ minHeight: L, paddingLeft: "32px" }}>
          {"MaxTokens: "}
          <span style={s("--syntax-num")}>{"128"}</span>
          {","}
        </div>
        <div style={{ minHeight: L, paddingLeft: "32px" }}>
          {"Messages: []"}
          <span style={s("--syntax-fn")}>{"anthropic"}</span>
          {"."}
          <span style={s("--syntax-fn")}>{"MessageParam"}</span>
          {"{{"}
        </div>
        <div style={{ minHeight: L, paddingLeft: "48px" }}>
          {"Role: "}
          <span style={s("--syntax-str")}>{'"system"'}</span>
          {", Content: systemPrompt},"}
        </div>
        <div style={{ minHeight: L, paddingLeft: "48px" }}>
          {"Role: "}
          <span style={s("--syntax-str")}>{'"user"'}</span>
          {", Content: body},"}
        </div>
        <div style={{ minHeight: L, paddingLeft: "32px" }}>{"}},"}</div>
        <div style={{ minHeight: L, paddingLeft: "16px" }}>{"});"}</div>
        <div style={{ minHeight: L }} />
        <div style={{ minHeight: L }}>
          <span style={s("--syntax-key")}>{"if"}</span>
          {" err != "}
          <span style={s("--syntax-key")}>{"nil"}</span>
          {" {"}
        </div>
        <div style={{ minHeight: L, paddingLeft: "16px" }}>
          <span style={s("--syntax-key")}>{"return"}</span>
          {" nil, fmt."}
          <span style={s("--syntax-fn")}>{"Errorf"}</span>
          {"("}
          <span style={s("--syntax-str")}>{'"classify: %w"'}</span>
          {", err)"}
        </div>
        <div style={{ minHeight: L }}>{"}"}</div>
      </pre>
    </div>
  )
}
