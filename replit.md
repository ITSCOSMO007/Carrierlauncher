# CareerCompass AI

AI-powered career guidance for teenagers and young adults — brutally honest, deeply personalized roadmaps powered by Groq's llama-3.3-70b-versatile.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/career-compass run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `GROQ_API_KEY`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind v4 + shadcn/ui components + Recharts + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: Groq SDK (llama-3.3-70b-versatile)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-zod/` — Generated Zod schemas and TypeScript types from OpenAPI spec
- `lib/api-client-react/` — Generated React Query hooks from OpenAPI spec
- `lib/db/src/schema/` — Drizzle ORM schemas (reports.ts)
- `artifacts/api-server/src/routes/` — Express route handlers (career.ts, chat.ts, reports.ts)
- `artifacts/api-server/src/lib/groq.ts` — Groq API helper
- `artifacts/career-compass/src/pages/` — All 8 frontend pages

## Architecture decisions

- OpenAPI-first: all API types flow from openapi.yaml → codegen → frontend hooks + backend Zod validators
- Dark mode only: forced via `document.documentElement.classList.add("dark")` in App.tsx
- Session data (quiz results) stored in sessionStorage, chat history in localStorage
- Reports saved to Postgres via REST; no user auth (reports are device-local by session)
- AI prompts are detailed and opinionated — the system prompt explicitly forbids generic advice
- `callGroqJson()` uses Groq's `response_format: { type: "json_object" }` for structured output

## Product

- **Quiz** (5 steps): age/country/personality → education/budget → interests → work style → goals/lifestyle
- **Results dashboard**: career matches with fit scores, salary charts, AI risk meter, skill trees, roadmap, resources, scholarships, colleges
- **AI Chat**: persistent chat with career context from quiz results
- **Career Comparison**: side-by-side analysis of 2–4 careers
- **Skill Gap Analyzer**: gap analysis from current skills to target career
- **AI Future Analyzer**: automation risk assessment with gauge chart + AI-resistant alternatives
- **Reports**: saved analysis reports in Postgres with preview/delete

## User preferences

- Dark mode only — deep dark background (#0a0f1e range), neon violet primary, cyan secondary
- Glassmorphism cards with backdrop-blur
- Space Grotesk for headings, Inter for body text
- Brutally honest, direct AI output — no generic advice or fake motivation
- No sign-up required

## Gotchas

- Always run `pnpm run typecheck:libs` before typechecking api-server when db schema changes
- The OpenAPI spec drives all types — don't add types manually to routes; generate them
- Groq JSON mode requires the word "JSON" in the prompt or it may not return JSON (handled in callGroqJson)
- Reports page uses `getGetReportQueryKey` and `getListReportsQueryKey` for proper cache invalidation

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
