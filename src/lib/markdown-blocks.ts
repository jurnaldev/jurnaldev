export type CalloutVariant = "info" | "warning" | "tip" | "success"

export type MarkdownBlock =
  | { type: "md"; content: string }
  | { type: "callout"; variant: CalloutVariant; content: string }
  | { type: "instagram"; url: string }

export function parseMarkdownBlocks(body: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const lines = body.split("\n")
  let buffer: string[] = []
  let calloutType: CalloutVariant | null = null
  let calloutOpening = ""
  let calloutBuffer: string[] = []
  let inCodeBlock = false

  const flushMarkdown = () => {
    if (buffer.length === 0) return
    blocks.push({ type: "md", content: buffer.join("\n") })
    buffer = []
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock
      ;(calloutType ? calloutBuffer : buffer).push(line)
      continue
    }
    if (inCodeBlock) {
      ;(calloutType ? calloutBuffer : buffer).push(line)
      continue
    }

    const start = line.match(/^:::(info|warning|tip|success)\s*$/)
    if (start && !calloutType) {
      flushMarkdown()
      calloutType = start[1] as CalloutVariant
      calloutOpening = line
      calloutBuffer = []
      continue
    }
    if (line.trim() === ":::" && calloutType) {
      blocks.push({
        type: "callout",
        variant: calloutType,
        content: calloutBuffer.join("\n"),
      })
      calloutType = null
      calloutOpening = ""
      calloutBuffer = []
      continue
    }
    if (calloutType) {
      calloutBuffer.push(line)
      continue
    }

    const instagram = line.match(
      /^https:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\/[^\s?]+/,
    )
    if (instagram) {
      flushMarkdown()
      blocks.push({ type: "instagram", url: instagram[0] })
      continue
    }
    buffer.push(line)
  }

  if (calloutType) {
    buffer.push(calloutOpening, ...calloutBuffer)
  }
  flushMarkdown()
  return blocks
}
