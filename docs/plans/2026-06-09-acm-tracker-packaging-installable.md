# ACM-TRACKER — Packaging & Installable Distribution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Backend/frontend code changes MUST be delegated to the repo agents (`backend-architect`, `frontend-architect`, `db-schema-guardian`) and audited with `code-reviewer`, per `CLAUDE.md`. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make ACM-TRACKER **installable** for four audiences, from simplest to most ambitious, without abandoning the self-hosted ethos. Each format is a distinct deliverable, but they share a **critical path**: every later format depends on earlier groundwork.

**Why now:** Today `docker compose up` still requires an external Postgres (`DATABASE_URL`) and the web image runs `vite dev` (a dev server) with a hardcoded `localhost` API URL. Neither is distributable to a non-expert. This plan fixes the foundation, then layers the four packaging targets on top.

---

## Critical path (do not parallelize across phases)

```
Phase 0  SQLite single-user mode (DB-1..DB-5 from the v1 plan addendum)
            └─ prerequisite for EVERYTHING: no bundled DB = not installable
Phase 1  Production build + single distributable Docker image on GHCR
            ├─ web served as static prod build (not vite dev)
            ├─ API_URL injectable at runtime (no hardcoded localhost)
            └─ `docker run` one-liner with a data volume
Phase 2  PWA (manifest + service worker over the Phase 1 prod build)  ← cheap win
Phase 3  Desktop app (Tauri: static web + API sidecar + SQLite)       ← biggest effort
Phase 4  Cloud one-click / Helm (reuses the GHCR image)               ← infra only
```

**Effort/ROI ranking:** Phase 1 (low-med, highest ROI) → Phase 2 (low) → Phase 4 (med) → Phase 3 (high).

---

## Architecture authority

Binding rules unchanged: `CLAUDE.md` (root), `apps/api/CLAUDE.md` (Hexagonal), `apps/web/CLAUDE.md` (reactive). Packaging is an **infrastructure/build concern** — domain and use cases must not change. The DB backend selection (SQLite vs Postgres) lives only in infrastructure, exactly as the v1 addendum established. The API already runs `prisma migrate deploy` on container start and writes uploads to a local `uploads/` dir — both are packaging-friendly once the DB is bundleable.

---

## Phase 0 — SQLite single-user mode (prerequisite)

This phase **is** tasks DB-1…DB-5 from the addendum in `docs/plans/2026-06-05-acm-tracker-v1-local.md` (§ Addendum 2026-06-09). It is restated here as the gate for packaging; do not duplicate the detail — execute it from that addendum.

- [ ] **P0:** Complete DB-1…DB-5 (Decimal→integer-cents + enum-as-string normalization, mirrored SQLite Prisma schema with drift check, `DB_BACKEND` env switch, `pnpm dev:solo`, green tests on both backends). Definition of done = the api boots against `file:./acm.db` with no Postgres reachable, and the full suite passes under `DB_BACKEND=sqlite`.

---

## Phase 1 — Single distributable Docker image (self-hoster, one command)

**Outcome:** `docker run -p 5173:5173 -v acm-data:/data ghcr.io/harrinson-gutierrez/acm-tracker` boots the whole app (web + api + SQLite) with zero external dependencies; data persists in the volume.

### Task 1.1 — Production web build, runtime-configurable API URL
- [ ] Replace `apps/web/Dockerfile` `CMD ["pnpm","dev"...]` with a **prod build** (`vite build`) served statically (vite `preview` or a tiny static server / nginx). No dev server in distributed images.
- [ ] Make the API base URL **runtime-configurable**, not baked at build time. `VITE_*` vars are compile-time; introduce a runtime config (e.g. a `/config.js` emitted at container start from an env var, or same-origin `/api` reverse-proxied) so one image works on any host/port without rebuild.
- [ ] Update `docker-compose.yml` `web.environment.VITE_API_URL` accordingly (remove the hardcoded `http://localhost`).
- [ ] **Verify:** built image serves the SPA and reaches the api on a non-localhost host.

### Task 1.2 — Single-image option (web + api + SQLite in one container)
- [ ] Add a combined image (multi-stage: build shared+api+web, then a runtime stage) whose entrypoint runs `prisma migrate deploy` (SQLite) + seeds on first run + starts the api and serves the static web. Default `DATABASE_URL="file:/data/acm.db"`, `DB_BACKEND=sqlite`.
- [ ] Mount point `/data` for the SQLite file and `/data/uploads` for files; document the named volume.
- [ ] Keep the **2-service compose** (web+api+Postgres) as the "team" deployment; the single image is the "solo" deployment. Both documented.
- [ ] **Verify:** `docker run ... -v acm-data:/data` → open the UI, create a project+task+time entry, restart the container, data persists.

### Task 1.3 — Publish to GHCR via CI
- [ ] Add a GitHub Actions workflow (`.github/workflows/release.yml`) that, on tag `v*` (and optionally on main), builds and pushes `ghcr.io/harrinson-gutierrez/acm-tracker:{version,latest}` (multi-arch amd64+arm64 via buildx).
- [ ] Document the pull/run command in README under a new "Instalar / Self-host" section.
- [ ] **Verify:** a pushed tag produces a pullable image that runs on a clean machine.

---

## Phase 2 — PWA (installable from the browser)

**Outcome:** visiting the app offers "Install ACM-TRACKER" (desktop icon, standalone window, mobile add-to-home).

### Task 2.1 — Manifest + icons + service worker
- [ ] Add `vite-plugin-pwa` (or hand-rolled `manifest.webmanifest` + SW). Flight Deck theming: `theme_color #0B0D12`, `background_color #0B0D12`, coral accent icon. Provide 192/512 maskable icons.
- [ ] Scope the service worker to **app-shell caching only** (static assets). Do **not** cache API responses blindly — time/cost data must stay live; an offline-stale tracker is worse than an error. Document this decision.
- [ ] **Verify:** Chrome/Edge shows the install affordation; installed PWA opens in its own window and loads the shell.

> Note: PWA does **not** remove the need to host api+web somewhere. It is an install *affordance* over a running deployment, complementary to Phase 1.

---

## Phase 3 — Desktop app (Tauri, double-click, no terminal)

**Outcome:** `ACM-Tracker-Setup.exe` / `.dmg` / `.AppImage` — a native window, SQLite local file, no Docker, no terminal. For non-technical users.

**Why Tauri over Electron:** ~10x smaller binary, Rust core, uses the OS webview. The web frontend is the same static prod build from Phase 1.

### Task 3.1 — API as a bundled sidecar
- [ ] Decide the backend packaging: bundle the NestJS api as a **Tauri sidecar** (a packaged Node runtime or a `pkg`/SEA single-binary of `dist/src/main.js`) that Tauri spawns on launch, pointed at a SQLite file in the OS app-data dir.
- [ ] Tauri shell loads the static web build; web talks to `http://127.0.0.1:<port>/api` (sidecar). Migrate+seed on first launch.
- [ ] **Verify (per OS):** install → icon → app window → create data → it persists in app-data → uninstall is clean.

### Task 3.2 — Installers + signing + auto-update
- [ ] Tauri bundler targets: NSIS/MSI (Windows), DMG (macOS), AppImage/deb (Linux).
- [ ] Code signing per OS (Windows Authenticode, macOS notarization) — required to avoid scary warnings. **This is the costly, fiddly part; budget for certificates.**
- [ ] Optional Tauri auto-updater wired to GitHub Releases.
- [ ] CI matrix builds the three installers on tag and attaches them to the GitHub Release.

---

## Phase 4 — Cloud one-click / Helm (operators, enterprise)

**Outcome:** a "Deploy" button and/or a Helm chart for teams that run their own infra. Reuses the Phase 1 GHCR image; **no new app code**.

### Task 4.1 — One-click templates
- [ ] `render.yaml` / `railway.json` (or equivalent) referencing the GHCR image + a managed Postgres + a persistent disk for uploads. "Deploy on Railway/Render" button in README.

### Task 4.2 — Helm chart
- [ ] `charts/acm-tracker/` with Deployment (api+web), Service, Ingress, a Postgres dependency (or external DB values), PVC for uploads, and values for `DB_BACKEND`/secrets. Document `helm install`.
- [ ] **Verify:** `helm install` on a kind/minikube cluster brings the app up healthy.

---

## Decisions captured (owner, 2026-06-09)

- **All four formats are wanted**, built in critical-path order (0→1→2→4→3 by ROI; 3 last due to signing cost).
- **SQLite single-user mode is the unlock** for installability — Phase 0 gates everything.
- License stays **AGPL-3.0 + commercial dual-licensing**; distributed images/installers carry the same license and the `COMMERCIAL-LICENSE.md` notice. Distributing binaries does **not** change obligations — AGPL's network clause is what matters, and self-hosting stays free.

## Out of scope (deferred)

- App-store distribution (Mac App Store / Microsoft Store) — extra review/sandboxing burden.
- Mobile-native (iOS/Android) apps beyond the PWA.
- Multi-tenant managed cloud offering (would be a separate commercial product, not "installable").

---

## Execution Handoff

Plan complete. Recommended: **subagent-driven**, one task at a time, PR per phase, CI green before merge (main is protected, `strict=true`). Phase 0 must merge before Phase 1 starts.
