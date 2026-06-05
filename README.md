# ACM-TRACKER

Self-hosted **time + cost tracker**. The single place to register how long work took and what it really cost — human time (rate × time) plus, later, AI cost (tokens × model price). Local app, remote database, no per-seat cost.

> Status: **v1 in progress** — building the time+cost core. See the implementation plan in [`docs/plans/`](docs/plans/).

## Why

Replace the Jira + Clockify combo with one self-hosted tool where:

- Time and cost live together, per **person** and per **project**.
- Cost is the real cost: `time × rate` today, `+ AI (tokens × model price)` in phase 2.
- A **MCP server** (phase 2) lets agents report work, time and tokens directly — the data model is already MCP-ready.
- Integrations are **notifications only** — this app is the single source of truth, not another platform to sync.

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Vite — reactive (TanStack Query + Zustand), decoupled reusable components (`apps/web`) |
| Backend | NestJS 10 — **Hexagonal** (ports & adapters), SOLID, RESTful (`apps/api`) |
| Shared | TypeScript types + cost helpers (`packages/shared`) |
| ORM / migrations | Prisma 5 (Postgres) |
| Database | **Remote** Postgres (via `DATABASE_URL`) — not bundled |
| Auth | Pluggable `AuthProvider`; v1 ships `NoAuthProvider` (single local owner). Cognito can be enabled later. |
| Run | `docker compose up` (2 services: web + api) |

## Run it (once v1 lands)

```bash
cp .env.example .env       # set DATABASE_URL to your remote Postgres
docker compose up --build
# open http://localhost:5173
```

## Design

Visual direction: **Flight Deck** — dark cockpit theme, ring gauges for burn rate,
JetBrains Mono for data + Inter for labels, technical grid background.
Screens are designed in Figma (page "ACM-TRACKER · Variations").

## Roadmap

- **v1 (now):** time+cost core — auth scaffold, Cabina, Projects, Tasks, manual time entries, cost = time × rate, Settings (members/rates).
- **v2:** MCP server (agents report work/time/tokens), AI cost (tokens × model price), model pricing table.
- **later:** documents (files + pages + links), reports & analytics, Cognito auth + invitations.

## Engineering standards

This repo enforces a strict quality contract — read [`CLAUDE.md`](CLAUDE.md), [`apps/api/CLAUDE.md`](apps/api/CLAUDE.md), [`apps/web/CLAUDE.md`](apps/web/CLAUDE.md). Backend is hexagonal (ports & adapters, SOLID); frontend is reactive with decoupled reusable components. SOLID, RESTful, zero-comment, reuse-before-create, small focused units. Specialized agents in `.claude/agents/` (backend-architect, frontend-architect, db-schema-guardian, code-reviewer) and skills in `.claude/skills/` keep implementation consistent and non-improvised.

## Docs

- [Implementation plans](docs/plans/)
- [Design mockups](docs/design/)
