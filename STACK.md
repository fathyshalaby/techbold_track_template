# Tech Stack — AI Service Desk Autopilot

> ⚠️ **This file previously described an aspirational/early-planning stack (Next.js 15, Vercel AI SDK 6,
> Anthropic Claude, assistant-ui, tree-sitter, Langfuse, …) that was NOT the path taken.** It is kept only
> as a record of the options considered. The **authoritative, as-built stack is below** and in
> `README.md` + `docs/ARCHITECTURE.md`.

## As-built stack

| Layer | Choice |
|-------|--------|
| Language / runtime | **TypeScript · Node 22** (backend run via `tsx`) |
| Backend framework | **Hono** (HTTP + SSE) — not Next.js |
| Frontend | **React 18 · Vite · TypeScript** (single-page technician workspace) |
| Agent framework | **Vercel AI SDK v5** with **`@ai-sdk/openai`** (`generateObject` structured output) |
| LLM | **OpenAI `gpt-4o`** by default (bring-your-own key; provider-agnostic via `LLM_PROVIDER`/`LLM_MODEL`) |
| Structured output / validation | **Zod** everywhere (tool args, ERP types, store schema, env) |
| SSH | **ssh2** (one approved command per exec; timeout + output cap) |
| Safety | Custom deterministic **blocklist + risk classifier + secret redaction** (regex-based; pure functions) |
| Storage / audit | **better-sqlite3** with a JSONL/in-memory fallback; append-only audit trail |
| Approval UI | Custom React approval cards (approve / edit / reject / abort) — not assistant-ui |
| Tooling | **pnpm** workspace · **Vitest** · **Docker Compose** |

## Why this shape
- One language (TypeScript) across agent, API, and UI, but **split** into a Vite frontend + a Hono backend rather than a single Next.js app — keeps the safety/SSH/secret boundary firmly server-side.
- The model **only proposes** (`generateObject`); the backend deterministically executes after human approval + a safety re-check. `executeApprovedCommand` is never exposed as a model tool.
- Safety is plain, auditable regex policy (not a parser dependency) so it's easy to read, test, and trust under the rubric's hard-fail rules.

See `docs/ARCHITECTURE.md` for the full component/data-flow design.
