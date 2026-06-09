# ACM-TRACKER

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](./LICENSE) [![Commercial license available](https://img.shields.io/badge/Commercial%20license-available-F44E5C.svg)](./COMMERCIAL-LICENSE.md)

Self-hosted **time + cost tracker**. The single source of truth for what work really costs — human time (rate × time) **plus AI cost** (tokens × model price, reported by agents via MCP). Local app, remote database, no per-seat cost.

> **Estado:** v1 + v2 funcionales y verificadas por E2E (19/19). UI fiel al diseño "Flight Deck". Costo IA real vía MCP.

![Cabina](docs/screenshots/app-01-cabina.png)

---

## Tabla de contenido

- [Qué es](#qué-es)
- [Stack y arquitectura](#stack-y-arquitectura)
- [Cómo levantarlo](#cómo-levantarlo)
- [Pantallas y funcionalidades](#pantallas-y-funcionalidades) ← **inventario completo**
- [API REST (endpoints)](#api-rest-endpoints)
- [Modelo de datos](#modelo-de-datos)
- [Pruebas (unit + E2E)](#pruebas-unit--e2e)
- [Convenciones de ingeniería](#convenciones-de-ingeniería)
- [Flujo de trabajo (PR)](#flujo-de-trabajo-pr)
- [Roadmap](#roadmap)
- [Docs internas](#docs-internas)
- [Licencia](#licencia)

---

## Qué es

Reemplaza el combo Jira + Clockify con una sola herramienta self-hosted donde:

- **Tiempo y costo viven juntos**, por persona y por proyecto.
- El costo es el costo real: `tiempo × tarifa` (humano) **+ tokens × precio de modelo** (IA).
- Un **servidor MCP** deja que los agentes (Claude Code, etc.) reporten trabajo, tiempo y tokens directamente — el costo IA se calcula con la tabla de precios y se concilia con el tiempo humano en la misma línea.
- Las **integraciones son solo notificaciones** — esta app es la fuente de verdad, no otra plataforma que sincronizar.
- **Self-hosted**, BD remota, sin costo por puesto. Auth pluggable (arranca sin auth, owner local).

Proyecto de ejemplo en los datos sembrados: **Helios · Plataforma fintech**.

---

## Stack y arquitectura

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite, **TanStack Query** (estado servidor) + **Zustand** (estado UI) |
| Backend | NestJS 10 — **Hexagonal** (ports & adapters), SOLID, RESTful |
| Compartido | `@acm/shared` — tipos + helpers de costo puros (CommonJS) |
| ORM | Prisma 5 |
| BD | **Postgres remoto** (vía `DATABASE_URL`) — no se empaqueta |
| Auth | `AuthProvider` pluggable; v1 = `NoAuthProvider` (owner local). Cognito enchufable después |
| Tests | Jest (api) · Vitest (shared) · **Playwright** (E2E web) |
| Run | `docker compose up` (web + api; BD remota) |

**Monorepo (pnpm workspaces):**

```
acm-tracker/
├── apps/
│   ├── api/   # NestJS hexagonal (domain/application/infrastructure/interfaces por módulo)
│   └── web/   # React + Vite (components reusables / features / screens) + e2e (Playwright)
├── packages/
│   └── shared/  # tipos + cost helpers (computeEntryCost, sumCost, aiCostFromUsage, breakdownCost)
├── docs/
│   ├── plans/        # planes de implementación (v1, v2, UI fidelity) — fuente de verdad de tareas
│   ├── design/       # frames Figma de referencia (01..13)
│   └── screenshots/  # capturas reales de la app
├── docker-compose.yml
└── CLAUDE.md         # contrato de ingeniería (reglas obligatorias)
```

**Backend hexagonal** — cada feature en `apps/api/src/modules/<feature>/`:
- `domain/ports/` — interfaces + Symbol token (el dominio no conoce Prisma ni Nest)
- `application/use-cases/` — un caso de uso = una clase con un `execute()`
- `infrastructure/persistence/` — adaptador Prisma + mapper (único lugar con Prisma)
- `interfaces/http/` — controller delgado + DTOs

**Frontend reactivo** — `apps/web/src/`:
- `components/` — presentacionales reusables (no fetchean): Chrome (sidebar+topbar), Panel, RingGauge, DonutGauge, StackedBars, StatTile, TileRow, Avatar, Tag, PersonCostRow, McpStream, TimerDock, DataTable, SideNav, CommandPalette
- `features/<feature>/api/` — hooks TanStack Query (con invalidación → la UI se refresca sola)
- `screens/` — componen features + componentes; `App.tsx` solo rutas

---

## Cómo levantarlo

> **Dos backends de BD.** Postgres es la **fuente de verdad** del schema; SQLite es un espejo "lite" para el modo solo-usuario. Se eligen con `DB_BACKEND` (`sqlite` por defecto · `postgres`). Detalle en [`apps/api/CLAUDE.md`](apps/api/CLAUDE.md#db-backends-postgres-source-of-truth-sqlite-mirror).

### Modo solo (SQLite, un usuario)

Sin Postgres ni Docker. Un solo comando levanta api + web sobre un archivo SQLite local (`file:./acm.db`, bajo `apps/api/prisma/sqlite/`):

```bash
pnpm install
pnpm dev:solo
# migra el set SQLite + seed (owner + proyecto Helios) y levanta:
# web  → http://localhost:5173
# api  → http://localhost:4000/api
```

`dev:solo` fija `DB_BACKEND=sqlite` y `DATABASE_URL=file:./acm.db`, corre `db:bootstrap` (migración SQLite idempotente + seed) y luego `pnpm dev`. El seed es idempotente: re-ejecutar no duplica datos. Para migrar/seedear sin levantar nada: `pnpm --filter @acm/api db:bootstrap`.

`DB_BACKEND=sqlite` es el **default** de la distribución: cualquier arranque sin variables de BD usa SQLite local.

### Con Docker (un comando)

```bash
cp .env.example .env        # set DATABASE_URL a tu Postgres remoto
docker compose up --build
# web  → http://localhost:5173
# api  → http://localhost:4000/api
```
Las migraciones corren solas al arrancar el contenedor `api`.

> Hay un `docker-compose.override.yml` (gitignored) opcional que levanta un Postgres local para pruebas.

### Instalar / Self-host (imagen única)

Una sola imagen con web + api + SQLite, sin dependencias externas. La api sirve el build estático del front en `/` y la API en `/api` (single-origin, sin CORS). Los datos persisten en un volumen montado en `/data` (BD `file:/data/acm.db` y archivos en `/data/uploads`).

```bash
docker run -p 5173:5173 -v acm-data:/data ghcr.io/harrinson-gutierrez/acm-tracker:latest
# app → http://localhost:5173   ·   api → http://localhost:5173/api
```

El entrypoint corre `db:bootstrap` (migrate + seed SQLite idempotente) en cada arranque y luego sirve la app. Reiniciar el contenedor conserva los datos del volumen `acm-data`.

Para construir la imagen localmente:

```bash
docker build -t acm-tracker .                 # Dockerfile de la raíz (multi-stage)
docker compose -f docker-compose.single.yml up --build   # o vía compose, con volumen acm-data
```

El modo 2-servicios (`docker-compose.yml`, web + api separados sobre Postgres) sigue siendo la opción "equipo"; la imagen única es la opción "solo".

### Cloud 1-click

Despliega la imagen GHCR con Postgres gestionado + disco persistente:

- **Render** — usa [`render.yaml`](render.yaml) (Blueprint): crea la web (imagen GHCR) + un Postgres gestionado + disco en `/data`. New → Blueprint → apunta a este repo.
- **Railway** — usa [`railway.json`](railway.json): build desde el `Dockerfile`, healthcheck en `/api/projects`. Añade un plugin Postgres y enlaza `DATABASE_URL` + `DB_BACKEND=postgres`.

### Kubernetes (Helm)

Chart en [`charts/acm-tracker`](charts/acm-tracker). Reusa la imagen GHCR.

```bash
# Modo solo (SQLite en un PersistentVolume — 1 réplica):
helm install acm ./charts/acm-tracker

# Modo equipo (Postgres externo — escalable):
helm install acm ./charts/acm-tracker \
  --set db.backend=postgres \
  --set db.postgres.url="postgresql://USER:PASS@HOST:5432/acm_tracker"
# o con un Secret existente:
#   --set db.postgres.urlSecret.name=acm-db --set db.postgres.urlSecret.key=databaseUrl

# Exponer con Ingress:
helm install acm ./charts/acm-tracker \
  --set ingress.enabled=true --set ingress.host=acm.example.com
```

Valores clave en [`values.yaml`](charts/acm-tracker/values.yaml): `db.backend` (sqlite|postgres), `persistence` (PVC para `/data`), `ingress`, `resources`, `cors.origin`. Con `db.backend=sqlite` mantén `replicaCount: 1` (un solo volumen); para HA usa `postgres`.

### App de escritorio (Tauri)

Ventana nativa (sin Docker, sin terminal): Tauri arranca la **api NestJS como sidecar** (un proceso Node que corre `dist/src/main.js`) apuntado a un SQLite en el directorio de datos del SO (`%APPDATA%\com.acmtracker.desktop` en Windows, `~/Library/Application Support/...` en macOS, `~/.local/share/...` en Linux). El front estático single-origin lo sirve la propia api; la ventana carga `http://127.0.0.1:5188/`. En el primer arranque corre migrate + seed (idempotente) contra esa BD.

```bash
# Dev (requiere Node + Rust/cargo). Ensambla el payload (build de web+api+shared) y lanza la ventana:
pnpm --filter @acm/desktop dev

# Build local de instaladores (NSIS/MSI · DMG · AppImage/deb):
pnpm --filter @acm/desktop build
```

El sidecar usa el **Node del sistema** (`node` en el PATH): es lo pragmático para que funcione hoy; ver el follow-up de Node embebido / SEA más abajo. Los instaladores firmados salen de CI: el workflow [`.github/workflows/desktop.yml`](.github/workflows/desktop.yml) compila la matriz `windows-latest`/`macos-latest`/`ubuntu-latest` al hacer push de un tag `desktop-v*` (o manualmente vía `workflow_dispatch`) y los adjunta a un **GitHub Release (draft)**. El **code-signing** (Authenticode en Windows, notarización en macOS) y el auto-updater quedan como TODO documentado en el workflow — requieren certificados de pago.

### Sin Docker, sobre Postgres (desarrollo)

```bash
pnpm install
cd apps/api && cp ../../.env.example .env   # DB_BACKEND=postgres + DATABASE_URL postgres
DB_BACKEND=postgres pnpm prisma migrate dev && pnpm seed   # owner + proyecto Helios
cd ../.. && DB_BACKEND=postgres pnpm dev                    # api + web en paralelo
```

### Variables de entorno (`.env`)

```
# Backend de BD: "sqlite" (default, modo solo) o "postgres"
DB_BACKEND=sqlite
# SQLite: opcional, default file:./acm.db. Postgres: requerido.
DATABASE_URL="file:./acm.db"
# DB_BACKEND=postgres → DATABASE_URL="postgresql://USER:PASS@HOST:5432/acm_tracker?schema=public"
API_PORT=4000
WEB_PORT=5173
OWNER_NAME="Harry G."
OWNER_EMAIL="owner@acm.local"
OWNER_RATE_PER_HOUR=45
# CORS: solo el modo 2-servicios lo necesita (web y api en orígenes distintos).
# Sin CORS_ORIGIN no se habilita CORS (single-origin, imagen única). Acepta "*" o lista separada por comas.
# CORS_ORIGIN=http://localhost:5173
# WEB_DIST_DIR: si se define, la api sirve ese build estático del front (single-origin). La imagen única lo fija a /repo/apps/web/dist.
# UPLOADS_DIR: carpeta de archivos subidos. Default local apps/api/uploads; en la imagen única /data/uploads.
```

---

## Pantallas y funcionalidades

La navegación es por **sidebar de íconos** (persistente, izquierda) + **⌘K / Ctrl+K** (command palette). Tema oscuro "Flight Deck": gauges de anillo, grid técnico, JetBrains Mono para datos.

### 1. Cabina (`/`)
![Cabina](docs/screenshots/app-01-cabina.png)
- **Burn rate de hoy**: gauge de anillo con el costo del día vs objetivo ($2,400), desglose Humano/IA.
- **Equipo · costo real hoy**: cada persona con su tiempo trackeado y costo (datos reales de `/reports/team-today`).
- **MCP · ingesta en vivo**: stream de reportes recibidos de agentes (vacío hasta que un agente reporte).
- **Tiles**: Hoy (trackeado), Semana, Facturable, Margen.
- **Timer dock**: "+ registrar tiempo" → abre el **modal de registro** (proyecto→tarea→minutos→facturable→guardar).
- Responsive: en móvil colapsa a una columna.

### 2. Proyectos (`/projects`)
![Proyectos](docs/screenshots/app-08-proyectos.png)
- Lista de proyectos con cliente y monto de contrato.
- **Crear proyecto** (input + Enter o "+ Crear").
- Clic en un proyecto → detalle.

### 3. Detalle de proyecto (`/projects/:id`)
- Header: avatar + nombre + contrato + etiqueta.
- **Tabs funcionales in-page**: Resumen / Tareas / Tiempo / Costos / Equipo / Documentos.
- **Costo real acumulado**: cifra grande, % consumido vs contrato, desglose Humano/IA/Horas (real, de `/projects/:id/cost`).
- **Tareas · tiempo + costo**: tabla con código, título, tiempo real, costo por tarea, y **"+ tiempo"** (abre el modal de registro preseteando la tarea).
- **Crear tarea** (input + "+ Tarea").
- **Tiempo**: cronología real de registros del proyecto (fecha/hora · tarea · persona · minutos · costo), de `/time-entries/project/:id`.
- **Equipo**: quién registró tiempo en el proyecto con horas + costo humano/IA/total, de `/reports/by-person?projectId=`.
- **Documentos**: documentos acotados al proyecto (alta con `projectId`), de `/documents?projectId=`.

![Proyecto · Tiempo](docs/screenshots/app-10-proyecto-tiempo.png)
![Proyecto · Equipo](docs/screenshots/app-11-proyecto-equipo.png)

### 4. Costos & IA (`/costs`)
![Costos](docs/screenshots/app-02-costos.png)
- Tiles: Proyectos, Humano, IA ($0 hasta que llegue vía MCP), Modelos con precio.
- **Composición del costo** (donut Humano/IA).
- **IA · costo por modelo**: tabla de precios (de `/model-prices`).

### 5. Reportes (`/reports`)
![Reportes](docs/screenshots/app-03-reportes.png)
- 5 KPIs calculados de datos reales: Horas, Costo total, Costo IA, $/hora prom, Personas.
- **Tiempo+costo por semana**: barras apiladas humano/IA (de `/reports/weekly`).
- **Por persona · costo real**: tabla (de `/reports/by-person`).
- **Exportar CSV** real (descarga `costo-por-persona.csv`).

### 6. Time tracker (`/tracker`)
![Tracker](docs/screenshots/app-04-tracker.png)
- Tiles del día: Trackeado, Facturable, Costo hoy, De IA.
- **Línea de tiempo**: entradas de hoy con hora, origen (tag `manual`/`mcp`), tarea, duración, costo (de `/time-entries/today`).
- **Objetivo del día**: progreso vs 8h.
- Timer dock con "+ registrar tiempo".

### 7. Servidor MCP (`/mcp`)
![MCP](docs/screenshots/app-05-mcp.png)
- **Endpoint** del servidor MCP.
- **Contrato `report_work()`**: el payload que un agente envía.
- **Reportes recibidos**: stream en vivo (poll cada 5s) de lo reportado por agentes — persona, tarea, tiempo, costo, modelo→$.
- Funcional: `POST /api/mcp/report-work` crea un time entry (origin=mcp) + ai_runs y **calcula el costo IA real** (tokens × precio de modelo).

### 8. Documentos (`/documents`)
![Documentos](docs/screenshots/app-06-documentos.png)
- **Sidebar de espacios + fases** (Ventas/Kickoff/Cotización/Prototipo/Validación/Ejecución/Entrega) que **filtra la lista** de verdad.
- **Crear documento** (título + URL opcional → tipo página/enlace; hereda la fase seleccionada).
- Tabla híbrida: ícono por tipo, fase (tag), creado por, fecha, **Borrar**.

### 9. Settings (`/settings`)
![Settings](docs/screenshots/app-07-settings.png)
- **SideNav**: Miembros & tarifas / Precios de modelos (scroll), MCP & tokens / Notificaciones (navegan).
- **Miembros & tarifas**: tabla con avatar, rol, tarifa $/h, estado.
- **Precios de modelos** (fuente de verdad del costo IA): tabla USD/1M tokens con **crear** (form) y **borrar** por fila.
- **Proveedor de autenticación**: modo actual (sin auth · owner local).

### 10. Notificaciones (`/notifications`)
- Banner: "solo avisos salientes, ACM-TRACKER es la fuente de verdad".
- Canales: Slack/Email/WhatsApp/Webhook.
- **Reglas de aviso**: tabla con **crear** (evento/condición/canal), **toggle** activar/desactivar (funcional), **borrar**.

### 11. Auth · sign-in (`/auth`)
![Auth](docs/screenshots/app-09-auth.png)
- Split: panel de marca con gauge + formulario de login.
- **Login funcional**: valida el email contra los miembros (`/auth/login`) → entra a la cabina. Modo sin-auth (owner local).

### 12. Command palette (⌘K / Ctrl+K)
- Overlay global con acciones de navegación a todas las secciones.

---

## API REST (endpoints)

Base: `http://localhost:4000/api` · todos protegidos por `AuthGuard` (en modo NoAuth resuelve al owner local).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PATCH | `/members` | miembros + tarifas |
| GET/POST/GET:id/PATCH | `/projects` `/projects/:id` | proyectos (con tareas en :id) |
| GET/POST/PATCH | `/tasks?projectId=` | tareas por proyecto |
| POST/GET | `/time-entries` `/time-entries/task/:id` | registrar/leer tiempo |
| GET | `/time-entries/task/:id/cost` | costo de una tarea |
| GET | `/time-entries/today` | entradas de hoy (timeline) |
| GET/POST/PATCH/DELETE | `/model-prices` | precios de modelos (CRUD) |
| GET | `/projects/:id/cost` | breakdown humano/IA/total del proyecto |
| GET | `/reports/by-person` · `/reports/weekly` | agregaciones |
| GET | `/reports/today` · `/reports/team-today` | resumen del día / equipo hoy |
| GET/POST/DELETE | `/documents?projectId=` | documentos (CRUD) |
| GET/POST/PATCH/DELETE | `/notification-rules` | reglas de notificación (CRUD + toggle) |
| POST/GET | `/mcp/report-work` · `/mcp/reports` | **ingesta MCP** (calcula costo IA) + reportes |
| POST | `/auth/login` · `/auth/me` | login (valida miembro) / owner |

### Ejemplo: reportar trabajo desde un agente (MCP)

```bash
curl -X POST http://localhost:4000/api/mcp/report-work -H "Content-Type: application/json" -d '{
  "taskId": "<task-id>",
  "memberEmail": "owner@acm.local",
  "minutes": 45,
  "output": "PR #318 preToken",
  "aiRuns": [{ "model": "claude-opus-4-8", "tokensIn": 1240, "tokensOut": 980 }]
}'
# → { "recorded": true, "aiCost": 0.09 }   (1240/1M×$15 + 980/1M×$75)
```

---

## Modelo de datos

Tablas Prisma (Postgres): `Member`, `Project`, `Task`, `TimeEntry` (con `origin: manual|mcp`), `AiRun` (tokens + costo, ligado a TimeEntry), `ModelPrice`, `Document`, `NotificationRule`, `WorkspaceSettings`.

- **Costo humano** = `minutes/60 × ratePerHourSnapshot` (la tarifa se congela al crear la entrada).
- **Costo IA** = Σ por `AiRun` de `(tokensIn/1M × inputPer1M) + (tokensOut/1M × outputPer1M)`.
- Helpers puros en `@acm/shared`: `computeEntryCost`, `sumCost`, `aiCostFromUsage`, `breakdownCost`.

---

## Pruebas (unit + E2E)

```bash
# unit (shared + api)
pnpm --filter @acm/shared test     # cost helpers
pnpm --filter @acm/api test        # use cases (hexagonal, fakes de puertos)

# E2E (requiere stack corriendo en :5173 / :4000)
pnpm --filter @acm/web e2e         # Playwright — 19 tests
```

Los unit tests del api usan fakes de puertos en memoria, así que son **agnósticos al backend**: pasan idénticos bajo `DB_BACKEND=sqlite` (default) y `DB_BACKEND=postgres`. Para verificar ambos localmente:

```bash
DB_BACKEND=sqlite   pnpm --filter @acm/api test    # 15/15
DB_BACKEND=postgres pnpm --filter @acm/api test    # 15/15
```

El drift-check de schema (Postgres source ↔ SQLite mirror) corre con `pnpm --filter @acm/api db:drift-check` y debe pasar en CI. Si CI quiere cubrir e2e en ambos backends, lo natural es una matriz `DB_BACKEND ∈ {sqlite, postgres}` (sqlite sin servicios; postgres con el `docker-compose.override.yml` throwaway).

La suite E2E (`apps/web/e2e/`) **asevera comportamiento real** de cada pantalla: navegación sidebar + ⌘K, flujo proyecto→tarea→tiempo→costo ($45), CRUD de proyectos/tareas/documentos/precios/reglas, toggle de reglas, login, export CSV, tabs de proyecto, filtro de documentos por fase, nav de settings, y **MCP report_work → costo IA $0.09**.

```
19 passed
```

---

## Convenciones de ingeniería

Reglas obligatorias en [`CLAUDE.md`](CLAUDE.md), [`apps/api/CLAUDE.md`](apps/api/CLAUDE.md), [`apps/web/CLAUDE.md`](apps/web/CLAUDE.md):
- SOLID, hexagonal (backend), reactivo + componentes desacoplados (frontend).
- Reuse-before-create, zero-comment, funciones cortas, RESTful (≤2 niveles de anidación).
- Agentes especializados en `.claude/agents/` (backend-architect, frontend-architect, db-schema-guardian, code-reviewer) y skills en `.claude/skills/`.

---

## Flujo de trabajo (PR)

`main` está **protegida**: no se puede push directo. Todo cambio va por Pull Request.

```bash
git checkout -b feat/mi-cambio
# ... cambios + tests ...
git push -u origin feat/mi-cambio
gh pr create --fill            # abrir PR
# revisar, luego mergear (squash recomendado)
gh pr merge --squash
```

---

## Roadmap

**Hecho (v1 + v2 + UI fidelity):**
- ✅ Núcleo tiempo+costo (auth scaffold, proyectos, tareas, time entries, costo = tiempo×tarifa).
- ✅ Costos & IA: tabla de precios de modelos, reportes (por persona, semanal), agregaciones del día.
- ✅ Servidor MCP funcional (`report_work` → costo IA real) + pantalla.
- ✅ Documentos (CRUD + filtro por fase), Notificaciones (CRUD + toggle), Auth login.
- ✅ 13 pantallas fieles al diseño Flight Deck + navegación + ⌘K + responsive.
- ✅ Suite E2E (19 tests).

**Siguiente:**
- ⏳ **Timer real en vivo** (cronómetro que corre y registra al parar), no solo registro manual.
- ⏳ **MCP server por protocolo** (SSE + tool registration) además del endpoint REST de ingesta.
- ⏳ **Auth Cognito** real (enchufar el `AuthProvider`) + invitaciones a workspace.
- ⏳ **Documentos**: subida de archivos real (storage), páginas con editor, costo de producción por doc.
- ⏳ **Margen y presupuesto** por proyecto (datos reales en los gauges que hoy muestran "—").
- ⏳ **Notificaciones**: envío real a los canales (Slack/email/webhook).
- ⏳ **Export**: PDF de reporte cliente y factura.
- ⏳ CI (GitHub Actions): build + unit + E2E en cada PR.
- ⏳ Deploy a producción (BD remota real + dominio).
- ⏳ **Modo solo-usuario sobre SQLite local** (`file:./acm.db`, sin Postgres ni `docker compose`) — Postgres sigue siendo la fuente de verdad del schema; SQLite es un adaptador "lite" espejo, seleccionable por `DB_BACKEND`. Detalle y tareas en el [addendum del plan v1](docs/plans/2026-06-05-acm-tracker-v1-local.md#addendum--2026-06-09--single-user-mode-on-local-sqlite).

**Instalable (4 formatos, ruta crítica — [plan de empaquetado](docs/plans/2026-06-09-acm-tracker-packaging-installable.md)):**
- ✅ **Self-host en 1 comando**: imagen única (web+api+SQLite, single-origin) con `docker run -p 5173:5173 -v acm-data:/data …`; el workflow de release publica multi-arch a GHCR en tag `v*`. *(Falta el smoke `docker build`/`run` en un host con Docker y el primer tag de release.)*
- ✅ **PWA**: instalable desde el navegador (manifest + service worker autoUpdate, iconos Flight Deck 192/512/maskable). El SW cachea solo el app-shell; `/api` nunca se cachea (datos siempre en vivo).
- ✅ **App de escritorio** (Tauri): ventana nativa, sidecar NestJS + SQLite en app-data del SO, single-origin. Instaladores `.exe`/`.msi`/`.dmg`/`.AppImage`/`.deb` los compila CI (`desktop.yml`) en tag `desktop-v*`. *(Falta code-signing — certificados de pago — y el smoke del primer arranque desde el instalador de CI.)*
- ✅ **Cloud one-click / Helm**: `render.yaml` + `railway.json` (1-click con Postgres gestionado) y chart de Helm (`charts/acm-tracker`, sqlite o postgres, PVC, ingress) — reusan la imagen GHCR.

---

## Docs internas

- [Planes de implementación](docs/plans/) — v1, v2 (costos/IA), UI Figma fidelity (cada tarea, inmutables).
- [Diseño Figma de referencia](docs/design/) — los 13 frames.
- [Capturas reales](docs/screenshots/) — la app funcionando.

---

## Licencia

ACM-TRACKER se distribuye bajo **GNU Affero General Public License v3.0 (AGPL-3.0)** — ver [`LICENSE`](./LICENSE).

- **Self-hosting libre:** úsalo, modifícalo y compártelo gratis para ti, tu equipo o tu empresa.
- **Copyleft de red:** si ofreces una versión **modificada** a terceros **por red**, debes publicar tu código bajo AGPL-3.0.
- **¿Necesitas SaaS cerrado o embeber en producto propietario?** Hay una **licencia comercial** disponible (dual-licensing) que levanta la obligación de abrir el código — ver [`COMMERCIAL-LICENSE.md`](./COMMERCIAL-LICENSE.md). Contacto: <hgutieco@gmail.com>.

© 2026 Harrinson Gutierrez Coronado.

---

Repo: https://github.com/harrinson-gutierrez/acm-tracker · Licencia: privada/personal.
