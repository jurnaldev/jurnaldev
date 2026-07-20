### Muhammad Fahmi Hidayat

Backend engineer based in Jakarta. Shipping TS Code in production. Learning AI out loud.

```text
ROLE       Backend Engineer
LOCATION   Jakarta, Indonesia
STACK      Node.js · Java · Python
JOURNAL    https://jurnal.dev
```

---

#### About

I spend most days writing backend services. Right now I'm learning AI out loud —
experimenting with LLMs, agentic workflows, and figuring out how to build useful
things with them. I write notes from the messy middle at [jurnal.dev](https://jurnal.dev).

#### Currently

- Building [jurnal.dev](https://jurnal.dev) — a journal from the messy middle of learning AI
- Exploring Claude + Model Context Protocol
- Shipping production Node.js & Java services

#### Stack

| Layer    | Tools                      |
| -------- | -------------------------- |
| Backend  | Node.js, Java, Python      |
| Frontend | Next.js, React, TypeScript |
| AI       | Claude API, MCP, LangChain |
| Infra    | Docker, PostgreSQL, Redis  |

#### Writing

I publish journal entries on [jurnal.dev/en/jurnal](https://jurnal.dev/en/jurnal)
and [jurnal.dev/id/jurnal](https://jurnal.dev/id/jurnal) — short notes about
AI experiments, backend patterns, and lessons learned in production.

Public pages use locale-prefixed URLs (`/en` and `/id`). The URL is the source
of truth for language; the language toggle navigates to the equivalent localized
page and uses the translated slug for detail pages. Legacy unprefixed links
remain valid through deterministic permanent `308` redirects.

#### Connect

- Web — [jurnal.dev](https://jurnal.dev)
- Instagram — [@jurnal.dev](https://instagram.com/jurnal.dev)
- LinkedIn — [fahmidyt](https://www.linkedin.com/in/fahmidyt/)
- Twitter — [@DevJurnal](https://twitter.com/DevJurnal)
- Email — [fmidyt@gmail.com](mailto:fmidyt@gmail.com)

---

<sub>Crafted in Jakarta · learning in public · open to interesting collaborations</sub>

#### Development

The application uses pnpm and Node.js 20:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
git diff --check
```

See [DOCS.md](./DOCS.md) for architecture, CMS setup, testing, and deployment.
