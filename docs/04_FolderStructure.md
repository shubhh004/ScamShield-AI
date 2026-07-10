# ScamShield AI — Folder Structure

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Approved |
| **Related** | [03_TechStack.md](./03_TechStack.md), [02_Architecture.md](./02_Architecture.md) |

---

## 1. Repository Overview

| Directory | Responsibility |
|-----------|---------------|
| `client/` | React SPA — all browser-executed code, components, pages, hooks |
| `server/` | Express API — all business logic, routes, services, database access |
| `shared/` | TypeScript types, constants, and pure utilities shared by client and server |
| `docs/` | Engineering documents, architecture decisions, API contracts |
| `assets/` | Static media: images, icons, fonts — no source code |
| `prompts/` | AI prompt templates loaded at runtime by the server |
| `scripts/` | One-off automation: seed, migrate, export — never imported by the app |
| `.agent/` | Agent skills and workflow definitions for Claude Code |
| `.claude/` | Claude Code workspace settings |

---

## 2. Repository Tree

```
ScamShield-AI/
├── client/
│   ├── public/
│   └── src/
├── server/
│   └── src/
├── shared/
│   ├── types/
│   ├── constants/
│   ├── utils/
│   └── schemas/
├── docs/
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── prompts/
├── scripts/
├── .agent/
│   ├── skills/
│   └── workflows/
├── .claude/
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Frontend Structure

```
client/src/
├── features/                  ← Feature modules (vertical slices)
│   ├── auth/                  ← Registration, login, password reset
│   ├── dashboard/             ← Home screen, stats, quick-scan entry
│   ├── url-scanner/           ← URL scan form and result view
│   ├── email-scanner/         ← Email scan form and result view
│   ├── sms-scanner/           ← SMS scan form and result view
│   ├── image-scanner/         ← Image upload and result view
│   ├── qr-scanner/            ← QR upload and result view
│   └── scan-history/          ← Searchable scan log
├── components/                ← Reusable UI primitives (no feature logic)
│   ├── ui/                    ← Button, Badge, Card, Input, Modal, Toast
│   ├── layout/                ← AppLayout, Sidebar, PageHeader
│   └── feedback/              ← Spinner, ErrorBoundary, EmptyState
├── hooks/                     ← Shared custom hooks (useDebounce, useAuth)
├── lib/
│   ├── api/                   ← Axios apiClient + per-feature API modules
│   ├── utils/                 ← Client-only formatters, date helpers
│   └── constants.ts           ← Client-only constants (routes, labels)
├── store/                     ← Zustand slices for client-only state
├── styles/                    ← Global CSS, Tailwind base, design tokens
├── types/                     ← Client-only TypeScript types
└── main.tsx                   ← App entry point, router, providers
```

**Feature module structure** — every feature follows this layout:

```
features/<feature>/
├── components/        ← Feature-specific components
├── hooks/             ← Feature-specific hooks
├── pages/             ← Page-level components (routed)
├── <feature>.api.ts   ← API calls for this feature
└── <feature>.types.ts ← Types used only within this feature
```

---

## 4. Backend Structure

```
server/src/
├── features/                  ← Feature modules (one per product feature)
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.schema.ts     ← Zod validation schemas
│   │   └── auth.types.ts
│   ├── scan-url/
│   ├── scan-email/
│   ├── scan-sms/
│   ├── scan-image/
│   ├── scan-qr/
│   ├── scan-history/
│   ├── dashboard/
│   └── notifications/
├── middleware/
│   ├── auth.middleware.ts      ← JWT verification
│   ├── validate.middleware.ts  ← Zod request validation
│   ├── rateLimit.middleware.ts ← Per-route throttling
│   └── errorHandler.middleware.ts
├── config/
│   ├── db.ts                  ← MongoDB connection
│   ├── env.ts                 ← Validated environment variables
│   └── logger.ts              ← Structured JSON logger
├── lib/
│   ├── gemini.client.ts       ← Gemini API wrapper
│   ├── cloudinary.client.ts   ← Image upload client
│   ├── ocr.client.ts          ← OCR service wrapper
│   ├── notification.service.ts
│   └── ai/
│       ├── pipeline.ts        ← AI processing pipeline orchestrator
│       ├── promptBuilder.ts   ← Prompt assembly per scan type
│       ├── riskScorer.ts      ← 0–100 score normalisation
│       ├── cache.ts           ← AI result cache (in-memory / Redis)
│       └── signalAggregator.ts ← Parallel external signal fetcher
├── workers/
│   ├── ai.worker.ts
│   ├── image.worker.ts
│   ├── notification.worker.ts
│   └── cleanup.worker.ts
└── index.ts                   ← Server bootstrap, middleware chain
```

---

## 5. Shared Module

`shared/` contains code with **zero environment-specific dependencies** — no `express`, no `mongoose`, no browser APIs.

| Directory | Contents |
|-----------|---------|
| `shared/types/` | API request/response interfaces used by both client and server |
| `shared/constants/` | Enums and values needed on both sides: `RiskLevel`, `ScanType`, `ScanStatus` |
| `shared/utils/` | Pure functions: formatters, date helpers, string sanitisers |
| `shared/schemas/` | Zod schemas that can be imported by both sides for identical validation |

**Dependency rule:** `shared/` imports nothing from `client/` or `server/`. Violation breaks the build.

---

## 6. Documentation Folder

| File | Responsibility |
|------|---------------|
| `00_Project_Principles.md` | Core engineering values and non-negotiable rules |
| `01_Vision.md` | Product vision, mission, target users, MVP scope, success metrics |
| `02_Architecture.md` | System architecture, diagrams, layer responsibilities |
| `03_TechStack.md` | Technology Decision Record — why every tool was selected |
| `04_FolderStructure.md` | Repository layout, naming conventions, import rules |
| `05_Database.md` | Schema definitions, indexing strategy, collection design |
| `06_API.md` | REST API contract: endpoints, request/response shapes, error codes |
| `07_UI_System.md` | Design system: tokens, components, motion, typography, colour |
| `08_AI.md` | AI pipeline design, prompt templates, risk scoring model |
| `09_Extension.md` | Chrome extension architecture and authentication flow |
| `10_Roadmap.md` | Release plan, feature phases, success criteria per version |
| `11_Deployment.md` | Deployment runbooks, environment setup, CI/CD pipeline |
| `12_Testing.md` | Testing strategy: unit, integration, E2E, coverage targets |

---

## 7. Naming Conventions

### Folders
- `kebab-case` everywhere — `url-scanner/`, `scan-history/`, `error-handler/`
- Feature folders named after the product feature, not the technical layer

### Files

| Entity | Convention | Example |
|--------|-----------|---------|
| React component | `PascalCase.tsx` | `ScanResultCard.tsx` |
| Page component | `PascalCase.page.tsx` | `DashboardPage.tsx` |
| Custom hook | `camelCase.hook.ts` | `useScamAnalysis.hook.ts` |
| Service | `camelCase.service.ts` | `scamAnalysis.service.ts` |
| Controller | `camelCase.controller.ts` | `scanUrl.controller.ts` |
| Repository | `camelCase.repository.ts` | `scanRecord.repository.ts` |
| Zod schema | `camelCase.schema.ts` | `auth.schema.ts` |
| Feature API module | `camelCase.api.ts` | `scanHistory.api.ts` |
| Types | `camelCase.types.ts` | `auth.types.ts` |
| Constants | `camelCase.constants.ts` | `riskLevel.constants.ts` |
| Worker | `camelCase.worker.ts` | `ai.worker.ts` |

### Variables and Identifiers

| Entity | Convention | Example |
|--------|-----------|---------|
| Variables / functions | `camelCase` | `analyzeMessage`, `isScamDetected` |
| React components | `PascalCase` | `RiskMeter`, `ScamAlertCard` |
| TypeScript interfaces | `PascalCase` | `ScanReport`, `UserSession` |
| Type aliases | `PascalCase` | `RiskLevel`, `ScanType` |
| Enums / enum members | `PascalCase` | `RiskLevel.High` |
| Constants | `SCREAMING_SNAKE_CASE` | `SCAM_CONFIDENCE_THRESHOLD` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `GEMINI_API_KEY` |
| Database collections | `camelCase` plural | `scanRecords`, `userSessions` |

---

## 8. Import Rules

### Allowed directions

```
Pages  →  Feature Components  →  Shared UI Components  →  Shared Utilities
  ↓               ↓                        ↓
Feature API    Feature Hooks           Shared Types
  ↓
API Client (lib/api/)
```

| From | May import | May NOT import |
|------|-----------|----------------|
| `pages/` | `features/`, `components/`, `hooks/`, `lib/`, `store/`, `shared/` | Nothing outside `client/` |
| `features/` | `components/`, `hooks/`, `lib/`, `shared/` | Other features directly |
| `components/` | `shared/`, `lib/utils/` | `features/`, `store/`, `pages/` |
| `server/features/` | `server/lib/`, `server/middleware/`, `shared/` | `client/` |
| `shared/` | Nothing | `client/`, `server/` |

### Forbidden patterns

- `client/` importing from `server/` — never; communication is HTTP only
- `server/` importing from `client/` — never
- `shared/` importing from either — never; would create circular dependencies
- One feature importing directly from another feature — extract to `shared/` or `components/` instead
- Controller importing from another controller — shared logic belongs in a service

---

## 9. Decision Log

| Decision | Reason |
|----------|--------|
| Feature-based folders over type-based (`components/`, `pages/` at root) | Collocates all files for a feature; deleting a feature deletes one directory |
| `shared/` as a third package alongside `client/` and `server/` | Eliminates type duplication across the API boundary without coupling the two sides |
| `lib/` inside both `client/` and `server/` | Avoids a shared utility package that would grow to include environment-specific code |
| Workers as separate files in `server/src/workers/` | Allows worker processes to be started independently without loading the full Express app |
| Prompts outside `server/` in `prompts/` | Prompt templates are non-code assets; keeping them separate allows non-engineers to edit them |
| AI sub-pipeline in `server/src/lib/ai/` | Isolates the AI pipeline from feature modules; the pipeline has no knowledge of HTTP or MongoDB |

---

## 10. Conclusion

This structure enforces two properties that compound in value as the codebase grows:

**Vertical isolation.** Each feature owns its entire slice — UI, API call, business logic, data access. Adding a feature adds one directory. Removing a feature removes one directory. No other feature is affected.

**Horizontal clarity.** Shared code lives in one place. Types are not duplicated between client and server. UI primitives are not duplicated between features. The import rules prevent the accidental coupling that causes spaghetti dependencies.

Together, these properties mean that a new engineer can understand any individual feature by reading a single directory, and can understand the entire system by reading this document.

---

| | |
|---|---|
| **Document Status** | Approved |
| **Version** | 1.0 |
| **Owner** | Engineering Team |
| **Next Document** | [05_Database.md](./05_Database.md) |
