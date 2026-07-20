import { describe, expect, it } from "vitest"
import { themeScript } from "./theme-script"

function runThemeScript(
  stored: string | null,
  systemDark: boolean,
  throws = false,
) {
  const classes = new Set<string>()
  const localStorage = {
    getItem: () => {
      if (throws) throw new Error("storage blocked")
      return stored
    },
  }
  const window = { matchMedia: () => ({ matches: systemDark }) }
  const document = {
    documentElement: {
      classList: {
        toggle: (name: string, enabled: boolean) =>
          enabled ? classes.add(name) : classes.delete(name),
      },
    },
  }
  new Function("localStorage", "window", "document", themeScript)(
    localStorage,
    window,
    document,
  )
  return classes.has("dark")
}

describe("themeScript", () => {
  it.each([null, "system", "corrupt"])(
    "uses system preference for %j",
    (stored) => {
      expect(runThemeScript(stored, true)).toBe(true)
      expect(runThemeScript(stored, false)).toBe(false)
    },
  )

  it("honors explicit themes", () => {
    expect(runThemeScript("dark", false)).toBe(true)
    expect(runThemeScript("light", true)).toBe(false)
  })

  it("does not crash when storage is unavailable", () => {
    expect(() => runThemeScript(null, true, true)).not.toThrow()
  })
})
