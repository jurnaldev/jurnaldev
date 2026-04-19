import type { StrapiArticle } from "./types"

// Mock articles — used when Strapi is offline or during initial dev.
// Swap to real Strapi by setting NEXT_PUBLIC_STRAPI_URL & STRAPI_API_TOKEN in .env.

const sampleBody = `
## The beginning

Gw mulai serius belajar AI karena satu alasan sederhana: **gw capek cuma nonton orang-orang ngomongin AI tanpa beneran ngoprek sendiri**.

> "If you can't build it, you don't understand it." — Richard Feynman (kurang lebih)

Jadi minggu ini gw mulai dari yang paling basic: manggil LLM dari code.

### Setup

Pertama, install dependencies-nya:

\`\`\`bash
npm install @anthropic-ai/sdk dotenv
\`\`\`

Lalu setup API key di \`.env\`:

\`\`\`bash
ANTHROPIC_API_KEY=sk-ant-...
\`\`\`

### First call

Ini kode pertama gw:

\`\`\`typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const message = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Hello, Claude!" }
  ],
});

console.log(message.content);
\`\`\`

:::info
**Tip**: Jangan commit \`.env\` file lu ke git. Add ke \`.gitignore\`.
:::

Run-nya simple:

\`\`\`bash
npx tsx first-call.ts
\`\`\`

### What I learned

Beberapa insight yang baru gw dapet:

| Konsep | Yang gw kira | Kenyataan |
|--------|-------------|-----------|
| Latency | Instant | 1-3 detik per call |
| Cost | Mahal | Surprisingly cheap buat experimentation |
| Prompt | Sekali jadi | Iteratif banget |

:::warning
**Jangan** pernah log full response di production tanpa sanitize. Ada PII risk.
:::

### Next steps

Minggu depan gw mau coba:

1. Streaming responses
2. Tool use (function calling)
3. Bikin agent sederhana

Follow di [@jurnal.dev](https://instagram.com/jurnal.dev) buat update harian.
`

export const mockArticles: StrapiArticle[] = [
  {
    id: 1,
    documentId: "mock-doc-1",
    slug: "pertama-kali-manggil-llm",
    title: "Pertama kali manggil LLM dari code",
    excerpt:
      "Gw mulai serius belajar AI dari yang paling dasar: bikin first API call ke Claude.",
    body: sampleBody,
    publishedAt: "2026-04-18T10:00:00.000Z",
    updatedAt: "2026-04-18T10:00:00.000Z",
    locale: "id",
    entryNumber: 1,
    featured: true,
    cover: null,
    tags: [
      { id: 1, documentId: "tag-1", name: "AI", slug: "ai" },
      { id: 2, documentId: "tag-2", name: "Tutorial", slug: "tutorial" },
    ],
    author: {
      id: 1,
      documentId: "author-1",
      name: "Fahmi Hidayat",
      bio: "Backend engineer learning AI, out loud.",
      avatar: null,
    },
  },
  {
    id: 2,
    documentId: "mock-doc-2",
    slug: "my-first-llm-call",
    title: "My first LLM call, from scratch",
    excerpt:
      "Starting my AI journey from the absolute basics — making my first API call to Claude.",
    body: sampleBody,
    publishedAt: "2026-04-18T10:00:00.000Z",
    updatedAt: "2026-04-18T10:00:00.000Z",
    locale: "en",
    entryNumber: 1,
    featured: true,
    cover: null,
    tags: [
      { id: 1, documentId: "tag-1", name: "AI", slug: "ai" },
      { id: 2, documentId: "tag-2", name: "Tutorial", slug: "tutorial" },
    ],
    author: {
      id: 1,
      documentId: "author-1",
      name: "Fahmi Hidayat",
      bio: "Backend engineer learning AI, out loud.",
      avatar: null,
    },
  },
  {
    id: 3,
    documentId: "mock-doc-3",
    slug: "streaming-responses",
    title: "Streaming LLM responses tanpa ribet",
    excerpt:
      "Kenapa streaming response bikin UX jauh lebih hidup, dan gimana implementasinya.",
    body: sampleBody,
    publishedAt: "2026-04-12T09:30:00.000Z",
    updatedAt: "2026-04-12T09:30:00.000Z",
    locale: "id",
    entryNumber: 2,
    featured: false,
    cover: null,
    tags: [
      { id: 1, documentId: "tag-1", name: "AI", slug: "ai" },
      { id: 3, documentId: "tag-3", name: "UX", slug: "ux" },
    ],
    author: {
      id: 1,
      documentId: "author-1",
      name: "Fahmi Hidayat",
      avatar: null,
    },
  },
  {
    id: 4,
    documentId: "mock-doc-4",
    slug: "streaming-responses-en",
    title: "Streaming LLM responses, done right",
    excerpt:
      "Why streaming makes UX feel alive, and how to implement it cleanly.",
    body: sampleBody,
    publishedAt: "2026-04-12T09:30:00.000Z",
    updatedAt: "2026-04-12T09:30:00.000Z",
    locale: "en",
    entryNumber: 2,
    featured: false,
    cover: null,
    tags: [
      { id: 1, documentId: "tag-1", name: "AI", slug: "ai" },
      { id: 3, documentId: "tag-3", name: "UX", slug: "ux" },
    ],
    author: {
      id: 1,
      documentId: "author-1",
      name: "Fahmi Hidayat",
      avatar: null,
    },
  },
  {
    id: 5,
    documentId: "mock-doc-5",
    slug: "agent-pertama-gw",
    title: "Agent pertama gw: MCP + Claude",
    excerpt:
      "Bikin agent sederhana yang bisa browse file system pake Model Context Protocol.",
    body: sampleBody,
    publishedAt: "2026-04-05T14:00:00.000Z",
    updatedAt: "2026-04-05T14:00:00.000Z",
    locale: "id",
    entryNumber: 3,
    featured: false,
    cover: null,
    tags: [
      { id: 1, documentId: "tag-1", name: "AI", slug: "ai" },
      { id: 4, documentId: "tag-4", name: "MCP", slug: "mcp" },
      { id: 5, documentId: "tag-5", name: "Agents", slug: "agents" },
    ],
    author: {
      id: 1,
      documentId: "author-1",
      name: "Fahmi Hidayat",
      avatar: null,
    },
  },
]

export function getMockArticles(locale: "en" | "id" = "en"): StrapiArticle[] {
  return mockArticles.filter((a) => a.locale === locale)
}

export function getMockArticleBySlug(
  slug: string,
  locale: "en" | "id" = "en",
): StrapiArticle | null {
  return (
    mockArticles.find((a) => a.slug === slug && a.locale === locale) ?? null
  )
}
