export function CodeSnippet() {
  const L = "1.7em"
  const s = (color: string) => ({ color: `var(${color})` })
  const comment = { ...s("--syntax-comment"), fontStyle: "italic" as const }

  return (
    <div
      data-animate="code-window"
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
          <span style={{ marginLeft: "8px" }}>factory.go</span>
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
        <div data-animate="code-line" style={{ minHeight: L }}>
          <span style={comment}>
            {"// NewProvider returns the Provider implementation"}
          </span>
        </div>
        <div data-animate="code-line" style={{ minHeight: L }}>
          <span style={s("--syntax-key")}>{"func"}</span>{" "}
          <span style={s("--syntax-fn")}>{"NewProvider"}</span>
          {"(cfg ProviderConfig, hc *http.Client) (Provider, error) {"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "16px" }}
        >
          <span style={s("--syntax-key")}>{"switch"}</span>
          {" cfg.Provider {"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "16px" }}
        >
          <span style={s("--syntax-key")}>{"case"}</span>{" "}
          <span style={s("--syntax-str")}>{'"anthropic"'}</span>
          {":"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "32px" }}
        >
          <span style={s("--syntax-key")}>{"return"}</span>{" "}
          <span style={s("--syntax-fn")}>{"NewAnthropic"}</span>
          {"("}
          <span style={s("--syntax-fn")}>{"AnthropicConfig"}</span>
          {"{"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "48px" }}
        >
          {"APIKey: cfg.APIKey, Model: cfg.Model,"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "48px" }}
        >
          {"BaseURL: cfg.BaseURL, HTTP: hc,"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "32px" }}
        >
          {"}), "}
          <span style={s("--syntax-key")}>{"nil"}</span>
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "16px" }}
        >
          <span style={s("--syntax-key")}>{"case"}</span>{" "}
          <span style={s("--syntax-str")}>{'"ollama"'}</span>
          {":"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "32px" }}
        >
          <span style={s("--syntax-key")}>{"return"}</span>{" "}
          <span style={s("--syntax-fn")}>{"NewOllama"}</span>
          {"("}
          <span style={s("--syntax-fn")}>{"OllamaConfig"}</span>
          {"{Model: cfg.Model, HTTP: hc}), "}
          <span style={s("--syntax-key")}>{"nil"}</span>
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "16px" }}
        >
          <span style={s("--syntax-key")}>{"default"}</span>
          {":"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "32px" }}
        >
          <span style={s("--syntax-key")}>{"return"}</span>{" "}
          <span style={s("--syntax-key")}>{"nil"}</span>
          {", fmt."}
          <span style={s("--syntax-fn")}>{"Errorf"}</span>
          {"("}
          <span style={s("--syntax-str")}>{'"unknown llm provider %q"'}</span>
          {", cfg.Provider)"}
        </div>
        <div
          data-animate="code-line"
          style={{ minHeight: L, paddingLeft: "16px" }}
        >
          {"}"}
        </div>
        <div data-animate="code-line" style={{ minHeight: L }}>
          {"}"}
          <span data-animate="code-caret" aria-hidden="true" />
        </div>
      </pre>
    </div>
  )
}
