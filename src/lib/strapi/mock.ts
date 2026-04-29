import type {
  StrapiArticle,
  StrapiLandingPage,
  StrapiSocialLink,
  Locale,
} from "./types"

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

// --- Landing page mocks ---

const landingPageEn: StrapiLandingPage = {
  id: 1,
  documentId: "mock-landing-en",
  locale: "en",
  role: "Backend Engineer",
  location: "Based in Indonesia",
  tagline: "learning AI, out loud.",
  displayName: "Fahmi.",
  handle: "FAHMI HIDAYAT · @JURNAL.DEV",
  statusDot: true,
  about: `I'm Fahmi — a backend engineer who spends most days shipping Node.js and Java services in production.

Right now I'm learning AI out loud: experimenting with LLMs, agentic workflows, and figuring out how to build useful things with them.

This is where I keep my notes. A journal from the messy middle of learning something new.`,
  currentlyLabel: "Currently",
  currentlyValue: "Learning AI + side projects",
  stackLabel: "Stack",
  stackValue: "Node.js · Java · Python",
  labCaption:
    "An experiment I'm working on — using AI to summarize dev journals.",
  footer: "© 2026 Fahmi Hidayat",
  built: "Crafted in Jakarta",
  sections: {
    about: "About",
    journal: "Journal",
    lab: "Lab",
    connect: "Connect",
  },
  journalEmpty: {
    title: "First entries coming soon.",
    desc: "Writing my first journal entries right now. Meanwhile, follow along on Instagram — that's where most of the raw thinking happens.",
    cta: "Follow on Instagram",
    ctaHref: "https://instagram.com/jurnal.dev",
  },
  journalViewAll: "View all entries",
  avatar: null,
  seo: null,
}

const landingPageId: StrapiLandingPage = {
  id: 2,
  documentId: "mock-landing-id",
  locale: "id",
  role: "Backend Engineer",
  location: "Tinggal di Indonesia",
  tagline: "belajar AI, out loud.",
  displayName: "Fahmi.",
  handle: "FAHMI HIDAYAT · @JURNAL.DEV",
  statusDot: true,
  about: `Gw Fahmi — backend engineer yang sehari-hari ngoprek service Node.js dan Java buat production.

Sekarang lagi belajar AI out loud: eksperimen sama LLM, agentic workflow, dan cari cara bikin sesuatu yang beneran berguna pake AI.

Di sini tempat gw nulis catatannya. Jurnal dari fase awal belajar sesuatu yang baru.`,
  currentlyLabel: "Sekarang",
  currentlyValue: "Belajar AI + side project",
  stackLabel: "Stack",
  stackValue: "Node.js · Java · Python",
  labCaption:
    "Salah satu eksperimen yang lagi gw kerjain — pake AI buat ngerangkum jurnal dev.",
  footer: "© 2026 Fahmi Hidayat",
  built: "Dibuat di Jakarta",
  sections: {
    about: "Tentang",
    journal: "Jurnal",
    lab: "Lab",
    connect: "Kontak",
  },
  journalEmpty: {
    title: "Jurnal pertama segera tayang.",
    desc: "Lagi nulis beberapa jurnal pertama. Sementara ini, ikutin di Instagram — tempat sebagian besar raw thinking-nya.",
    cta: "Ikuti di Instagram",
    ctaHref: "https://instagram.com/jurnal.dev",
  },
  journalViewAll: "Lihat semua entry",
  avatar: null,
  seo: null,
}

export function getMockLandingPage(locale: Locale = "en"): StrapiLandingPage {
  return locale === "id" ? landingPageId : landingPageEn
}

const mockSocialLinks: StrapiSocialLink[] = [
  {
    id: 1,
    documentId: "mock-social-1",
    name: "Instagram",
    href: "https://instagram.com/jurnal.dev",
    order: 1,
    enabled: true,
    icon: "instagram",
  },
  {
    id: 2,
    documentId: "mock-social-2",
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/fahmidyt/",
    order: 2,
    enabled: true,
    icon: "linkedin",
  },
  {
    id: 3,
    documentId: "mock-social-3",
    name: "GitHub",
    href: "https://github.com/jurnaldev",
    order: 3,
    enabled: true,
    icon: "github",
  },
  {
    id: 4,
    documentId: "mock-social-4",
    name: "Twitter",
    href: "https://twitter.com/DevJurnal",
    order: 4,
    enabled: true,
    icon: "twitter",
  },
]

export function getMockSocialLinks(): StrapiSocialLink[] {
  return mockSocialLinks
}
