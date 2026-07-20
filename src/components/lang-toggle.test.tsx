// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { LangProvider } from "@/contexts/lang-context"
import { LangToggle } from "./lang-toggle"

const navigation = vi.hoisted(() => ({ pathname: "/en/jurnal" }))

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}))

describe("LangToggle", () => {
  afterEach(cleanup)

  beforeEach(() => {
    navigation.pathname = "/en/jurnal"
  })

  it("marks the active locale as current without making it a link", () => {
    render(
      <LangProvider initialLang="en">
        <LangToggle />
      </LangProvider>,
    )

    expect(screen.getByText("en").getAttribute("aria-current")).toBe("page")
    expect(screen.getByText("en").closest("a")).toBeNull()
  })

  it("links an available alternate to the exact supplied URL", () => {
    render(
      <LangProvider initialLang="en">
        <LangToggle alternateHref="/id/jurnal/judul-terjemahan?draft=1" />
      </LangProvider>,
    )

    expect(
      screen
        .getByRole("link", { name: "Switch to Bahasa Indonesia" })
        .getAttribute("href"),
    ).toBe("/id/jurnal/judul-terjemahan?draft=1")
  })

  it("derives the alternate URL for a general localized page", () => {
    navigation.pathname = "/id/portfolio"

    render(
      <LangProvider initialLang="id">
        <LangToggle />
      </LangProvider>,
    )

    expect(
      screen
        .getByRole("link", { name: "Switch to English" })
        .getAttribute("href"),
    ).toBe("/en/portfolio")
  })

  it("disables a missing detail translation with accessible text", () => {
    render(
      <LangProvider initialLang="en">
        <LangToggle alternateHref={null} />
      </LangProvider>,
    )

    const unavailable = screen.getByLabelText(
      "Bahasa Indonesia: Translation unavailable",
    )
    expect(unavailable.getAttribute("aria-disabled")).toBe("true")
    expect(unavailable.closest("a")).toBeNull()
  })
})
