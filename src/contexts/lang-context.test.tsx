// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { LangProvider, useLang } from "./lang-context"

function ContextProbe() {
  const context = useLang()

  return (
    <>
      <output aria-label="active language">{context.lang}</output>
      <output aria-label="context keys">
        {Object.keys(context).sort().join(",")}
      </output>
    </>
  )
}

describe("LangProvider", () => {
  afterEach(cleanup)

  beforeEach(() => {
    localStorage.clear()
  })

  it("exposes the route locale on the first render", () => {
    render(
      <LangProvider initialLang="id">
        <ContextProbe />
      </LangProvider>,
    )

    expect(screen.getByLabelText("active language").textContent).toBe("id")
  })

  it("does not let stored language override the route locale", () => {
    localStorage.setItem("jurnal-dev-lang", "en")

    render(
      <LangProvider initialLang="id">
        <ContextProbe />
      </LangProvider>,
    )

    expect(screen.getByLabelText("active language").textContent).toBe("id")
  })

  it("does not let the browser language override the route locale", () => {
    Object.defineProperty(navigator, "language", {
      configurable: true,
      value: "id-ID",
    })

    render(
      <LangProvider initialLang="en">
        <ContextProbe />
      </LangProvider>,
    )

    expect(screen.getByLabelText("active language").textContent).toBe("en")
  })

  it("persists the validated route locale after navigation", async () => {
    const { rerender } = render(
      <LangProvider initialLang="en">
        <ContextProbe />
      </LangProvider>,
    )

    rerender(
      <LangProvider initialLang="id">
        <ContextProbe />
      </LangProvider>,
    )

    await waitFor(() => {
      expect(localStorage.getItem("jurnal-dev-lang")).toBe("id")
    })
  })

  it("exposes no imperative language setter", () => {
    render(
      <LangProvider initialLang="en">
        <ContextProbe />
      </LangProvider>,
    )

    expect(screen.getByLabelText("context keys").textContent).toBe("lang")
  })
})
