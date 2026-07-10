---
name: scamshield-standards
description: Permanent engineering handbook for ScamShield AI. Reference this skill whenever generating, reviewing, or refactoring any code in this project. Defines architecture, coding conventions, folder responsibilities, security rules, and AI development rules.
---

# ScamShield AI — Engineering Standards Handbook

This document is the single source of truth for all engineering decisions in ScamShield AI. Every line of generated code, every PR, and every architectural choice must conform to these standards. When in doubt, consult this handbook before proceeding.

---

## 1. Project Philosophy

### 1.1 Production Quality by Default

Every feature is written as if it ships to real users tomorrow. No placeholder logic, no `// TODO: fix later`, no shortcuts that "work for now." Prototypes become production code; write it right the first time.

### 1.2 Readability Over Cleverness

Code is read 10× more than it is written. Prefer the obvious solution over the clever one. A junior engineer joining the team should be able to understand any function within 30 seconds without explanation.

### 1.3 Clean Architecture

ScamShield AI enforces a strict separation of concerns:

- **Presentation layer** — what users see (React components, pages)
- **Application layer** — orchestration and use-case logic (controllers, services)
- **Domain layer** — core business rules, independent of frameworks
- **Infrastructure layer** — databases, external APIs, file system, email

Each layer may only depend on the layer beneath it. No component imports directly from the database. No service imports from a UI component.

### 1.4 SOLID Principles

| Principle | Rule |
|-----------|------|
| **S**ingle Responsibility | Every module, class, and function does exactly one thing |
| **O**pen/Closed | Extend behaviour via composition, not by modifying existing code |
| **L**iskov Substitution | Subtypes must be substitutable for their base types without breaking the system |
| **I**nterface Segregation | Expose only the methods a consumer actually needs |
| **D**ependency Inversion | Depend on abstractions, not concrete implementations |

### 1.5 Modular Design

Features are self-contained modules. Adding or removing a feature should not require changes scattered across unrelated files. Each module owns its routes, controller, service, schema, and types.

### 1.6 Reusable Components

Before writing a new component or utility, search for an existing one. Extract shared logic into `shared/`. Never duplicate logic — duplication is a maintenance liability.

### 1.7 Small Functions

A function should do one thing and fit entirely on one screen (roughly 20–30 lines maximum). If it needs a comment to explain what it does, it should be split into smaller, well-named functions.

### 1.8 Scalable Structure

Directory structure, naming conventions, and module boundaries are chosen to accommodate a growing codebase. A file structure that works at 10 features must also work at 100.

---

## 2. Coding Standards

### 2.1 TypeScript First

All source files use TypeScript (`.ts`, `.tsx`). JavaScript files are never introduced. `tsconfig.json` enforces strict mode.

```jsonc
// tsconfig.json — required compiler options
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2.2 Strict Typing

- `any` is banned. Use `unknown` and narrow the type explicitly.
- All function parameters and return types are explicitly annotated.
- API response shapes are typed with interfaces, never inferred from raw `fetch()` calls.
- Prefer `type` for union/intersection types; prefer `interface` for object shapes that may be extended.

```ts
// Bad
const handleResponse = (data: any) => { ... }

// Good
const handleResponse = (data: ScamAnalysisResult): void => { ... }
```

### 2.3 Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Variables & functions | `camelCase` | `analyzeMessage`, `isScamDetected` |
| React components | `PascalCase` | `ScamAlertCard`, `ReportModal` |
| TypeScript interfaces | `PascalCase` | `ScamReport`, `UserSession` |
| TypeScript types | `PascalCase` | `ScamCategory`, `RiskLevel` |
| Enums | `PascalCase` members | `RiskLevel.High` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS` |
| File names (components) | `PascalCase.tsx` | `ScamAlertCard.tsx` |
| File names (utils/services) | `camelCase.ts` | `scamDetection.service.ts` |
| Database collections | `camelCase` plural | `scamReports`, `userSessions` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `OPENAI_API_KEY` |

### 2.4 Meaningful Variable Names

Names must communicate intent. Single-letter variables are only acceptable as loop indices in short, obvious loops.

```ts
// Bad
const d = new Date();
const r = await fetch(url);
const x = data.filter(i => i.s > 0.8);

// Good
const createdAt = new Date();
const response = await fetch(scamCheckEndpoint);
const highRiskReports = reports.filter(report => report.confidenceScore > 0.8);
```

### 2.5 No Magic Numbers

Every numeric or string literal with business meaning is extracted to a named constant.

```ts
// Bad
if (score > 0.85) flagAsScam();

// Good
const SCAM_CONFIDENCE_THRESHOLD = 0.85;
if (score > SCAM_CONFIDENCE_THRESHOLD) flagAsScam();
```

### 2.6 Early Returns

Guard clauses eliminate nesting. Return or throw at the top of a function for invalid/error states, then write the happy path without indentation.

```ts
// Bad
function processReport(report: ScamReport | null) {
  if (report) {
    if (report.isVerified) {
      // ... 20 lines of logic
    }
  }
}

// Good
function processReport(report: ScamReport | null): void {
  if (!report) return;
  if (!report.isVerified) return;
  // ... happy path logic, no nesting
}
```

### 2.7 Avoid Deeply Nested Logic

Maximum nesting depth is **3 levels**. Beyond that, extract a named helper function.

### 2.8 Comments — Only Where the "Why" Is Non-Obvious

Do not comment what the code does — name it well instead. Only comment when there is a hidden constraint, a non-obvious invariant, or a deliberate workaround.

```ts
// Bad: comment restates the code
// Increment the counter
count++;

// Good: comment explains a non-obvious constraint
// Delay required: the AI provider rate-limits to 60 req/min across all users
await delay(1000);
```

---

## 3. Folder Responsibilities

```
ScamShield-AI/
├── client/          # React frontend application
├── server/          # Node.js/Express backend API
├── shared/          # Code shared between client and server
├── docs/            # Architecture decisions, API contracts, runbooks
├── assets/          # Static media: images, icons, fonts
├── prompts/         # AI prompt templates and system instructions
├── scripts/         # One-off automation: seed, migrate, deploy
└── .agent/          # Agent skills and workflow definitions
```

### `client/`

Owns everything the browser executes. Structure by feature, not by file type.

```
client/
├── src/
│   ├── features/        # Feature modules (scam-checker, reports, auth, dashboard)
│   │   └── scam-checker/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── pages/
│   │       └── scamChecker.api.ts
│   ├── components/      # Shared, reusable UI primitives (Button, Modal, Badge)
│   ├── hooks/           # Shared custom hooks
│   ├── lib/             # Client-side utilities (formatters, validators, constants)
│   ├── store/           # Global state (Zustand / Redux slices)
│   ├── styles/          # Global CSS, design tokens
│   └── main.tsx
```

**Rule:** `client/` never contains business logic. It calls the API; it does not compute scam scores.

### `server/`

Owns the entire API surface, database access, and all business logic.

```
server/
├── src/
│   ├── features/        # Feature modules (each owns its route, controller, service, schema)
│   │   └── scam-analysis/
│   │       ├── scamAnalysis.routes.ts
│   │       ├── scamAnalysis.controller.ts
│   │       ├── scamAnalysis.service.ts
│   │       ├── scamAnalysis.schema.ts    # Zod validation schemas
│   │       └── scamAnalysis.types.ts
│   ├── middleware/      # Auth, rate limiting, error handling
│   ├── config/          # Environment loading, DB connection, logger setup
│   ├── lib/             # Server-side utilities (AI client, email, storage)
│   └── index.ts         # Entry point: wire up Express and start server
```

### `shared/`

Contains code that is imported by both `client/` and `server/` with zero modification. Must have zero environment-specific dependencies.

```
shared/
├── types/           # TypeScript interfaces for API request/response shapes
├── constants/       # Values used on both sides (risk levels, category enums)
└── utils/           # Pure functions: formatters, validators with no side effects
```

**Rule:** If it imports `express`, `mongoose`, or any browser API, it does not belong in `shared/`.

### `docs/`

Stores decisions, not just descriptions.

```
docs/
├── architecture/    # System diagrams, ADRs (Architecture Decision Records)
├── api/             # OpenAPI / REST contract documentation
├── runbooks/        # How to deploy, rollback, seed, or recover
└── decisions/       # Why we chose X over Y (dated, signed)
```

### `assets/`

Static media only. No source code. Organized by type.

```
assets/
├── images/
├── icons/
└── fonts/
```

### `prompts/`

All AI prompts are version-controlled here, never hardcoded in source files.

```
prompts/
├── scam-detection.md    # System prompt for scam classification
├── report-summary.md    # Prompt for generating human-readable summaries
└── few-shot-examples/   # Example inputs/outputs for fine-tuning prompts
```

**Rule:** Prompt files are Markdown. They are loaded at runtime, not bundled.

### `scripts/`

Executable automation for non-runtime tasks.

```
scripts/
├── seed.ts          # Populate database with development fixtures
├── migrate.ts       # Run pending database migrations
└── exportReports.ts # One-off data export utilities
```

**Rule:** Scripts are run manually or by CI, never by the running application.

---

## 4. React Standards

### 4.1 Functional Components Only

Class components are never used. Every component is a function that returns JSX.

### 4.2 Hooks for All State and Side Effects

- `useState` for local UI state
- `useEffect` for side effects (with proper cleanup)
- `useCallback` / `useMemo` only when profiling shows a real performance problem — not by default
- Custom hooks (`useScamAnalysis`, `useReportFilters`) for reusable stateful logic

### 4.3 Feature-Based Organization

Components live in the feature they belong to. Generic, reusable primitives live in `client/src/components/`. Never mix the two.

```
features/
└── scam-checker/
    ├── components/
    │   ├── MessageInputForm.tsx    # feature-specific
    │   └── ScamResultBadge.tsx     # feature-specific
    └── pages/
        └── ScamCheckerPage.tsx
components/
├── Button.tsx          # reusable primitive
├── Badge.tsx           # reusable primitive
└── Modal.tsx           # reusable primitive
```

### 4.4 Reusable UI

Before creating a component, check `components/` for an existing primitive that can be extended via props. Extract shared UI patterns immediately when they appear in two or more features.

### 4.5 No Duplicated Logic

If two components share behaviour, extract a custom hook. If two pages share layout, extract a layout component. Identical JSX blocks in two files is always a bug to fix.

### 4.6 Component Rules

- One component per file.
- Props interfaces are always typed explicitly (`interface ScamAlertCardProps { ... }`).
- Default exports for components, named exports for hooks and utilities.
- Prop destructuring happens in the function signature, not the body.

```tsx
// Good
interface ScamAlertCardProps {
  report: ScamReport;
  onDismiss: () => void;
}

export default function ScamAlertCard({ report, onDismiss }: ScamAlertCardProps) {
  // ...
}
```

---

## 5. Backend Standards

### 5.1 MVC + Service Layer

Every feature follows a four-layer pattern:

```
Route → Controller → Service → Repository/Model
```

| Layer | Responsibility |
|-------|---------------|
| **Route** | Declares HTTP method, path, middleware chain |
| **Controller** | Reads request, calls service, writes response |
| **Service** | Executes business logic, orchestrates models and external calls |
| **Repository/Model** | Database queries only |

### 5.2 Controllers Stay Thin

A controller function should be 10–20 lines maximum. It reads from `req`, calls one service function, and sends a response. No `if/else` business logic lives in a controller.

```ts
// Good controller
export const analyzeMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body as AnalyzeMessageDto;
    const result = await scamAnalysisService.analyze(message);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

### 5.3 Business Logic Lives in Services

All logic that touches business rules (scam scoring, risk classification, report generation) belongs in service files. Services are pure TypeScript — they do not import `express` types.

### 5.4 Validation Before Controllers Reach Business Logic

Use Zod to define request schemas. A validation middleware validates `req.body` against the schema and returns a `400` before the controller function is ever called.

```ts
// scamAnalysis.schema.ts
export const analyzeMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  channel: z.enum(['sms', 'email', 'whatsapp', 'other']),
});

// applied in routes
router.post('/analyze', validate(analyzeMessageSchema), analyzeMessage);
```

### 5.5 Centralized Error Handling

All errors propagate via `next(error)`. A single error-handling middleware at `server/src/middleware/errorHandler.ts` formats every error response. No route or controller formats error responses directly.

```ts
// Error handler signature
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    success: false,
    error: { message: err.message, code: err.code },
  });
};
```

---

## 6. Database Standards

### 6.1 Consistent Schema Naming

| Rule | Example |
|------|---------|
| Collection names: camelCase plural | `scamReports`, `userSessions` |
| Field names: camelCase | `createdAt`, `isVerified`, `confidenceScore` |
| IDs: always `_id` (Mongo) or `id` (SQL) | `report._id` |
| Boolean fields: `is` or `has` prefix | `isActive`, `hasBeenReviewed` |

### 6.2 Timestamps on Every Document

Every schema includes `createdAt` and `updatedAt`. These are set automatically by the ORM/ODM.

```ts
const scamReportSchema = new Schema({
  // ... fields
}, { timestamps: true });
```

### 6.3 Soft Delete Ready

No hard deletes. Records are marked `isDeleted: true` with a `deletedAt` timestamp. All queries filter `{ isDeleted: false }` by default.

```ts
isDeleted: { type: Boolean, default: false },
deletedAt: { type: Date, default: null },
```

### 6.4 Proper Indexing

Every field used in a `find()` query filter or sort is indexed. Compound indexes are added where query patterns require them. Indexes are declared in the schema, not applied manually.

```ts
scamReportSchema.index({ userId: 1, createdAt: -1 });
scamReportSchema.index({ riskLevel: 1, isDeleted: 1 });
```

### 6.5 Scalable Collections

- No unbounded arrays embedded in documents (use references for one-to-many).
- Documents have a predictable maximum size.
- Every collection has a clear ownership model (which service is allowed to write to it).

---

## 7. Security Rules

### 7.1 Authentication — JWT

All protected API routes require a valid JWT in the `Authorization: Bearer <token>` header. Tokens are signed with `HS256` and have an expiry. Refresh tokens are stored server-side (not in `localStorage`).

### 7.2 Password Hashing — bcrypt

Passwords are hashed with `bcrypt` at a cost factor of **12** minimum. Plaintext passwords never appear in logs, responses, or the database.

```ts
const BCRYPT_SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
```

### 7.3 HTTP Security Headers — Helmet

`helmet` is applied globally as the first middleware in the Express app. Its defaults are not overridden without a documented reason.

### 7.4 CORS

CORS is configured with an explicit allowlist of origins. `origin: '*'` is never used in production.

```ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  credentials: true,
}));
```

### 7.5 Environment Variables

All secrets and environment-specific values live in `.env` files. `.env` files are never committed to git. The application validates required environment variables at startup and exits with a clear error if any are missing.

```
# .env.example (committed to git — lists required keys with placeholder values)
MONGODB_URI=
JWT_SECRET=
OPENAI_API_KEY=
BCRYPT_SALT_ROUNDS=12
```

### 7.6 Input Validation

All external input (HTTP request bodies, query parameters, URL params) is validated with Zod before touching any application logic. Invalid input returns `400 Bad Request` with a descriptive message.

### 7.7 Rate Limiting

Every public API endpoint is protected with rate limiting. Authentication endpoints (`/login`, `/register`, `/forgot-password`) use stricter limits than general endpoints.

```ts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts. Try again in 15 minutes.',
});
```

### 7.8 Never Expose Secrets

- No secrets in client-side code.
- No secrets in console logs.
- No secrets in error messages returned to the client.
- No secrets in git history (use `git-secrets` or equivalent pre-commit hook).

---

## 8. Git Standards

### 8.1 Branch Strategy

```
main           — production-ready code only; protected branch
develop        — integration branch; all features merge here first
feature/<name> — new features (feature/scam-detection-api)
fix/<name>     — bug fixes (fix/jwt-expiry-handling)
chore/<name>   — non-user-facing work (chore/upgrade-dependencies)
docs/<name>    — documentation only (docs/api-reference)
```

No direct commits to `main` or `develop`. All changes arrive via pull request.

### 8.2 Conventional Commits

All commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

| Type | Use for |
|------|---------|
| `feat` | A new user-facing feature |
| `fix` | A bug fix |
| `chore` | Build, tooling, dependency updates |
| `docs` | Documentation only |
| `refactor` | Code restructuring without behaviour change |
| `test` | Adding or updating tests |
| `style` | Formatting only (no logic change) |
| `perf` | Performance improvement |

Examples:

```
feat(scam-analysis): add confidence score to AI response
fix(auth): resolve JWT expiry not being validated on refresh
chore(deps): upgrade mongoose to 8.x
docs(api): document scam report endpoints
```

### 8.3 Small, Atomic Commits

Each commit represents one logical change. A reviewer should be able to read the commit message and understand exactly what changed and why. Commits that touch 10+ unrelated files are a sign the change should be split.

### 8.4 Meaningful Commit Messages

- Subject line: imperative mood, ≤72 characters, no full stop
- Body (if needed): explains *why*, not *what*
- Never: "fix stuff", "wip", "asdf", "changes", "update"

---

## 9. Documentation Rules

### 9.1 Architecture Decisions Are Recorded

Whenever a significant architectural decision is made (choice of database, auth strategy, AI provider, state management library), an Architecture Decision Record (ADR) is created in `docs/decisions/`.

```
docs/decisions/
└── 001-use-mongodb-for-flexible-schema.md
└── 002-jwt-over-session-cookies.md
└── 003-openai-as-primary-ai-provider.md
```

Each ADR includes: **Date**, **Status**, **Context**, **Decision**, **Consequences**.

### 9.2 Keep Docs Synchronized with Implementation

Documentation that is out of date is worse than no documentation — it actively misleads. When a feature changes, its documentation changes in the same PR.

### 9.3 Architecture First

Before implementing a non-trivial feature, write a short design note describing:

1. What the feature does
2. Which components are involved
3. What the data model looks like
4. What can go wrong and how it is handled

Implementation follows the design. The design note becomes the PR description.

### 9.4 API Contracts Are Explicit

Every endpoint is documented with its request shape, response shape, and error codes. This lives in `docs/api/` and is kept synchronized with the Zod schemas in `server/`.

---

## 10. AI Development Rules

These rules govern how AI agents (including Claude) should generate code for this project.

### 10.1 Never Generate Unnecessary Code

Generate exactly what is requested. Do not add extra fields, extra routes, extra configuration, or extra abstractions "just in case." If scope is unclear, ask before writing.

### 10.2 Never Skip Architecture

Every generated feature must follow the four-layer pattern (Route → Controller → Service → Repository). Never collapse layers for convenience. Never write database queries inside a controller. Never write business logic inside a component.

### 10.3 Keep Functions Small

Generated functions must respect the 20–30 line maximum. If generation requires a longer function, split it into well-named helpers immediately.

### 10.4 Prefer Composition Over Duplication

When generating code that resembles something already in the codebase, extend or compose the existing code. Search for existing utilities, hooks, and services before writing new ones.

### 10.5 Maintain Consistency with Existing Project Structure

Generated files land in the correct folder based on the responsibilities defined in Section 3. Generated file names follow the naming conventions in Section 2.3. Generated types are co-located with their feature module.

### 10.6 Ask Before Generating Ambiguous Requirements

If a requirement is ambiguous — the data model is unclear, the API contract is unspecified, or the business rule has multiple valid interpretations — stop and ask for clarification before writing code. Generating incorrect code wastes more time than asking a question.

### 10.7 TypeScript Strictness Is Non-Negotiable

Generated code never uses `any`. All generated functions include explicit return type annotations. All generated interfaces are explicitly typed.

### 10.8 Security Is Applied by Default

Generated endpoints always include:
- Zod validation middleware
- Authentication middleware (if the route is protected)
- Rate limiting for public-facing endpoints

Generated password handling always uses `bcrypt`. Generated tokens always use `JWT`. These are not optional.

### 10.9 No Half-Finished Implementations

Generated code is complete and functional. Placeholder comments like `// implement later`, `// TODO: add validation`, or `// handle error here` are not acceptable. If the full implementation cannot be produced in one pass, state this clearly and ask how to proceed.

### 10.10 One Feature, One Module

Generated features are self-contained. All files for a new feature (route, controller, service, schema, types) are created together in a single feature directory. Nothing is scattered across unrelated folders.

---

*This handbook is a living document. When a new architectural pattern is adopted, when a security requirement changes, or when a convention is updated, this file is updated in the same PR. It is never allowed to drift out of sync with the actual engineering practices of the project.*
