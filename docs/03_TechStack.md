# ScamShield AI — Technology Decision Record

| | |
|---|---|
| **Document Version** | 1.0 |
| **Status** | Approved |
| **Last Updated** | July 2026 |
| **Audience** | Engineering, Technical Leadership |
| **Related Documents** | [02_Architecture.md](./02_Architecture.md), [04_FolderStructure.md](./04_FolderStructure.md) |

---

## Table of Contents

1. [Document Information](#1-document-information)
2. [Technology Selection Philosophy](#2-technology-selection-philosophy)
3. [Frontend Technologies](#3-frontend-technologies)
4. [Backend Technologies](#4-backend-technologies)
5. [Database](#5-database)
6. [AI Stack](#6-ai-stack)
7. [Development Tools](#7-development-tools)
8. [Deployment Stack](#8-deployment-stack)
9. [Comparison Tables](#9-comparison-tables)
10. [Decision Log](#10-decision-log)
11. [Future Technology Evolution](#11-future-technology-evolution)
12. [Conclusion](#12-conclusion)

---

## 1. Document Information

This document is the authoritative Technology Decision Record (TDR) for ScamShield AI. It explains not just what technologies have been selected, but why each was chosen, what alternatives were evaluated, what trade-offs were accepted, and under what conditions a technology should be reconsidered.

Technology decisions made without documented reasoning are invisible to engineers who join later and impossible to challenge constructively. This document prevents that. Every entry in this record must satisfy the question: *if a senior engineer unfamiliar with this project read this section, would they understand and agree with the reasoning?*

This document does not contain installation guides, tutorials, or code examples. It is a decision record, not a how-to manual.

---

## 2. Technology Selection Philosophy

Every technology selected for ScamShield AI was evaluated against seven criteria. Technologies that fail more than two criteria are rejected regardless of their popularity or novelty. Technologies that excel across all seven are given strong preference even when a more popular alternative exists.

### 2.1 Maintainability

Code is read and modified far more often than it is written. Technology choices that make code easier to read, reason about, and safely change are weighted heavily. This criterion rules out technologies with unusual mental models, sparse documentation, or communities that have moved on.

### 2.2 Security

ScamShield AI is a security product. Technologies with known, unpatched vulnerabilities, poor security defaults, or histories of supply-chain compromise are rejected. This criterion also covers the security model of the technology itself — how it handles data, whether it exposes surface area unnecessarily, and how quickly its maintainers respond to CVEs.

### 2.3 Scalability

MVP-scale and production-scale are different problems. Technologies are evaluated for their ability to handle both: they must work correctly for a single user and must have a documented path to hundreds of thousands of users. Technologies that require a full rewrite to scale are accepted only when the rewrite path is low-friction and well-understood.

### 2.4 Performance

A security analysis tool must return results fast. Technologies that introduce unnecessary overhead — in network latency, bundle size, server CPU, or database query time — require justification. Performance is not an afterthought; it is a user experience requirement.

### 2.5 Community Support

Technologies with large, active communities mean more answered Stack Overflow questions, more open-source tooling, more tutorials for onboarding new engineers, and faster security patch cycles. Technologies maintained by a single company with no community backup are accepted only when no alternative exists.

### 2.6 Developer Experience

Developer experience directly affects velocity, code quality, and team morale. Technologies with excellent TypeScript support, clear error messages, good tooling, and well-structured documentation produce better software faster. Technologies that fight the developer are rejected even when they are technically superior in isolation.

### 2.7 Long-Term Stability

Technologies are not evaluated at their current version — they are evaluated for where they are likely to be in five years. Rapidly changing APIs, unclear governance, corporate ownership risks, and declining ecosystem momentum are all negative signals. Stable, well-governed technologies that move slowly and break things rarely are preferred.

---

## 3. Frontend Technologies

### 3.1 React

**Purpose:** The primary UI rendering library. All interactive components, pages, and application state binding are built with React.

**Why Selected:** React's component model maps directly to the feature-based architecture defined in the engineering standards. Each feature module owns its components, and those components compose cleanly into pages. React's unidirectional data flow eliminates entire classes of bugs related to inconsistent UI state. Its ecosystem — React Query, React Router, Zustand, Framer Motion — integrates tightly, reducing the need for custom solutions. React's adoption rate means every new engineer joining the project already knows it.

**Alternatives Considered:**
- *Vue 3* — Excellent DX and Composition API is comparable to hooks. Rejected because the ecosystem around Vue for the specific combination of animation, 3D, and data-fetching tools we need is narrower than React's.
- *Svelte / SvelteKit* — Compelling compile-time approach with smaller bundle sizes. Rejected because the ecosystem is immature for a project of this complexity, and TypeScript support, while improving, is not yet at parity.
- *Angular* — Enterprise-grade and opinionated. Rejected because its boilerplate overhead and steep learning curve are mismatched with a small team moving fast.

**Trade-offs:**
- React itself is unopinionated, which means architectural decisions that other frameworks enforce by default (routing, state management, data fetching) must be made explicitly. This is a feature, not a bug, but it requires discipline to execute consistently.
- JSX is not valid HTML or JavaScript, which adds a minor cognitive barrier for contributors new to the ecosystem.

**Future Evolution:** React 19 and the React Compiler are on the roadmap. The Compiler eliminates manual `useMemo` and `useCallback` optimisation, which will simplify the codebase. Server Components are relevant if the project moves to Next.js for SEO requirements on public-facing pages.

---

### 3.2 TypeScript

**Purpose:** The primary programming language for all frontend source files. TypeScript compiles to JavaScript and adds static typing across the entire codebase.

**Why Selected:** TypeScript is the single highest-leverage investment in code quality available on the frontend. It catches type errors at compile time that would otherwise manifest as runtime bugs in production. For a security platform where incorrect data handling has real consequences, static typing is not optional. TypeScript also powers the IDE experience — autocompletion, refactoring, and documentation — that keeps developer velocity high as the codebase grows.

Strict mode is enabled. `noImplicitAny`, `noImplicitReturns`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` are all enforced. These settings prevent the most common type errors and force explicit handling of edge cases that untyped code ignores.

**Alternatives Considered:**
- *Plain JavaScript* — Rejected outright. A growing codebase with multiple contributors cannot maintain quality without type safety.
- *JSDoc typed JavaScript* — Provides type hints without compilation. Rejected because it is second-class citizen in most tooling compared to native TypeScript, and the discipline to maintain JSDoc annotations is higher than the cost of using TypeScript directly.

**Trade-offs:**
- TypeScript adds a compilation step, which extends the feedback loop slightly compared to plain JavaScript. Vite's native TypeScript support keeps this overhead negligible in practice.
- Strict mode occasionally produces types that are technically correct but feel overly defensive. The discipline required to write correct types is a feature, not a bug.

**Future Evolution:** TypeScript's trajectory is stable and well-governed. No migration away from TypeScript is anticipated. The primary evolution will be adopting newer TypeScript features as they stabilise.

---

### 3.3 Vite

**Purpose:** The frontend build tool and development server. Vite compiles TypeScript, bundles assets, and serves the development environment with Hot Module Replacement.

**Why Selected:** Vite's development server starts in under a second and provides near-instant HMR because it uses native ES modules rather than bundling the entire application on startup. In a large feature-based codebase, the difference between a 30-second rebuild and an instant reload determines whether developers lose their flow state. Vite's production build uses Rollup under the hood, which produces well-optimised, tree-shaken output.

**Alternatives Considered:**
- *Create React App (Webpack)* — The legacy default. Rejected because its build times are dramatically slower than Vite at scale, it is no longer actively maintained, and its configuration is opaque.
- *Next.js* — A meta-framework rather than a build tool. Rejected for the MVP because server-side rendering introduces operational complexity not justified by the current requirements. Documented as a future migration path for SEO requirements.
- *Parcel* — Zero-config and fast. Rejected because its plugin ecosystem and TypeScript integration are less mature than Vite's.

**Trade-offs:**
- Vite's development server and production build use different tools (esbuild vs. Rollup). Production build issues occasionally differ from development behaviour, though this is rare in practice.
- Some older libraries with CommonJS-only distributions require compatibility shims.

**Future Evolution:** Vite is the de facto standard build tool for React projects in 2026. No replacement is anticipated. The Vite team is actively developing Rolldown, a Rust-based bundler that will unify the development and production build pipelines, further improving speed.

---

### 3.4 TailwindCSS

**Purpose:** The utility-first CSS framework used to style all UI components. Tailwind provides a constrained set of design tokens — spacing, colour, typography, shadows — as composable utility classes.

**Why Selected:** Tailwind eliminates the two most common CSS scaling problems: naming (no class names to invent) and specificity (no cascading conflicts). The entire design system lives in `tailwind.config.js` — colours, spacing scale, font choices, breakpoints — and every component in the codebase draws from that single source. The design system documented in `07_UI_System.md` maps directly to Tailwind's configuration.

Tailwind's purge mechanism removes unused styles at build time, resulting in production CSS bundles that are typically under 10 KB — smaller than any hand-written stylesheet for an application of this size.

**Alternatives Considered:**
- *CSS Modules* — Scoped CSS per component. Rejected because it requires inventing class names for every element, does not enforce a design system, and makes cross-component visual consistency harder to maintain.
- *Styled Components / Emotion (CSS-in-JS)* — Runtime CSS generation in JavaScript. Rejected because it adds bundle size, can cause style flickering on initial render, and is trending away from as the React ecosystem moves toward compile-time solutions.
- *Shadcn/UI with Radix* — A component library built on Tailwind. Adopted partially — Radix primitives are used for accessible components (dialogs, dropdowns) but the styling layer is custom Tailwind, not Shadcn's pre-built styles.

**Trade-offs:**
- Tailwind's utility class composition can produce verbose JSX when many styles are combined. This is managed with `clsx` for conditional class composition and extracted component variants.
- Developers unfamiliar with Tailwind face a one-time learning curve to internalise the class naming conventions.

**Future Evolution:** Tailwind v4 moves the configuration from JavaScript to CSS variables, which reduces JavaScript bundle size and integrates more naturally with native CSS features. Migration when v4 stabilises is low-risk.

---

### 3.5 React Router

**Purpose:** Client-side routing. React Router manages the URL, renders the correct page component for each route, and handles protected route logic.

**Why Selected:** React Router v6 is the established standard for React SPAs. Its `<Outlet>` pattern is a natural fit for the nested layout structure of ScamShield AI: the `AppLayout` component wraps all authenticated pages and the scanner pages render inside it. Code-splitting with `lazy()` is straightforward. The `ProtectedRoute` component pattern — which checks authentication state before rendering a page — is simple to implement and test.

**Alternatives Considered:**
- *TanStack Router* — Type-safe routing with file-based conventions. A strong alternative. Not selected for the MVP because its API was in flux at the time of selection. Documented as a future migration candidate once it reaches v1 stability.
- *Next.js App Router* — File-system-based routing. Rejected with the decision to use a plain SPA rather than a meta-framework.

**Trade-offs:**
- React Router's data loading patterns (`loader`, `action`) were introduced in v6 but their interaction with React Query creates redundancy. ScamShield AI uses React Query for data fetching and treats React Router as a pure routing layer, which avoids the conflict but means not using some of v6's newer capabilities.

**Future Evolution:** If the project migrates to Next.js, React Router is replaced by the App Router. Within the current SPA architecture, React Router remains the correct choice.

---

### 3.6 TanStack Query (React Query)

**Purpose:** Server state management. TanStack Query handles all data fetching from the backend API, including caching, background refetching, loading states, error states, and optimistic updates.

**Why Selected:** The fundamental insight behind TanStack Query is that server state and client state are different problems. Server state is remote, asynchronous, and shared — it can change at any time and must be synchronised. Client state is local and synchronous. Most state management libraries treat them the same, which produces unnecessarily complex code.

TanStack Query provides a cache keyed on query identifiers. When the user navigates to the scan history page, the data is served from cache instantly and refreshed in the background. When a scan completes, invalidating the relevant cache keys causes every component displaying that data to update automatically. This eliminates the manual cache invalidation logic that is a common source of bugs.

**Alternatives Considered:**
- *SWR (Vercel)* — Similar concept. Rejected because TanStack Query has a more complete feature set for mutations, optimistic updates, infinite queries, and devtools.
- *Redux Toolkit Query* — RTK Query integrates data fetching into the Redux store. Rejected because it ties server state to a global Redux store, which TanStack Query shows is unnecessary. We use Zustand for client state instead.
- *Manual fetch + useEffect* — Maximum control, maximum boilerplate. Rejected because writing cache invalidation, loading states, error handling, and retry logic from scratch is expensive and error-prone.

**Trade-offs:**
- TanStack Query introduces a new mental model that developers new to it must learn. The distinction between `useQuery` and `useMutation`, and understanding cache key design, is non-obvious initially.
- The query cache adds a layer of indirection between the component and the API, which can make debugging data flow harder for developers unfamiliar with the devtools.

**Future Evolution:** TanStack Query v5 introduced streaming support and improved TypeScript inference. No migration away from TanStack Query is anticipated. The library's trajectory is stable and its maintainer (Tanner Linsley) is active.

---

### 3.7 Zustand

**Purpose:** Client-side global state management. Zustand stores ephemeral UI state that must be shared across components but does not originate from the server: sidebar collapsed state, active scan type, modal visibility, toast queue.

**Why Selected:** Zustand's API is minimal. A store is created with `create()`, state is defined with properties, and actions are defined as functions in the same object. There is no action type enum, no reducer switch statement, no dispatch function, and no Provider component to wrap the tree. Reading and updating state is direct and type-safe. The entire store for the MVP fits in a handful of files.

Zustand also supports slices for organising large stores, middleware for logging and persistence, and does not cause unnecessary re-renders because components subscribe only to the slices they use.

**Alternatives Considered:**
- *Redux Toolkit* — The modern Redux experience is significantly better than legacy Redux, but it still requires more conceptual overhead (slices, thunks, selectors) than Zustand for the quantity of client state ScamShield AI actually manages. Rejected as overengineered for the problem.
- *Jotai* — Atomic state model. Elegant for granular subscriptions but requires a different mental model than Zustand's store-based approach. Rejected because the team's familiarity with store-based state management is higher.
- *React Context + useReducer* — No additional dependency. Rejected because React Context triggers re-renders in all consumers when any value changes, which creates performance problems as the app grows.

**Trade-offs:**
- Zustand's flexibility means architectural decisions (how to structure the store, when to split into multiple stores) must be made explicitly rather than enforced by the library.
- Debugging state changes is less structured than Redux DevTools, though Zustand does support the Redux DevTools extension via middleware.

**Future Evolution:** Zustand is stable, lightweight, and has no stated plans to introduce breaking changes. No migration is anticipated.

---

### 3.8 Axios

**Purpose:** The HTTP client used by the frontend API layer. Axios is the intermediary between React components and the Express backend.

**Why Selected:** Axios provides request and response interceptors, which are essential for ScamShield AI's authentication pattern. The request interceptor attaches the JWT access token to every outbound request. The response interceptor catches 401 errors and silently triggers a token refresh before retrying the original request. This logic is written once in `apiClient.ts` and applies to every API call across the entire application without any component-level knowledge.

Axios also normalises error handling — failed requests throw consistent `AxiosError` objects with response body and status code accessible in a uniform way across all environments.

**Alternatives Considered:**
- *Native `fetch`* — Built into the browser, zero dependency weight. Rejected because `fetch` does not support request interceptors natively. Implementing the token refresh interceptor pattern with `fetch` requires a custom wrapper that replicates what Axios provides out of the box, for no architectural benefit.
- *ky* — A lightweight `fetch` wrapper with hooks (similar to interceptors). A valid alternative. Not selected because the team's familiarity with Axios and its ecosystem is higher.

**Trade-offs:**
- Axios is an additional dependency (~13 KB gzipped). For most applications, this is negligible. For ScamShield AI's use case, the interceptor pattern justifies it definitively.

**Future Evolution:** If the project moves to a meta-framework with native server-side data fetching, native `fetch` may be appropriate on the server side. Axios remains the correct choice for client-side requests from the SPA.

---

### 3.9 Framer Motion

**Purpose:** The animation library for all UI transitions, entrance animations, micro-interactions, and gesture-based interactions.

**Why Selected:** Framer Motion operates on a declarative animation model that integrates naturally with React's component lifecycle. Entering and exiting animations are declared as props on the component, not managed as imperative side effects. This makes animations composable, testable, and easy to reason about. Framer Motion also handles `AnimatePresence` — the technically complex problem of animating components as they unmount from the React tree — which is essential for smooth scan result reveals and modal transitions.

For a security product where users may be in a state of anxiety about a suspicious link or message, smooth, reassuring animations contribute meaningfully to the perception of trustworthiness and control.

**Alternatives Considered:**
- *CSS Transitions / Keyframes* — No dependency. Rejected for complex orchestrated animations because CSS alone cannot animate components on unmount, cannot sequence cascading reveals, and cannot be composed with React state elegantly.
- *React Spring* — Physics-based animation. Powerful for natural-feeling motion. Rejected because its API is more complex than Framer Motion for the animation patterns ScamShield AI requires, and Framer Motion's layout animations are superior.
- *GSAP* — Industry-standard animation library. Powerful but has licensing considerations for commercial products and is heavier than Framer Motion for React integration.

**Trade-offs:**
- Framer Motion adds bundle weight (~35 KB gzipped). For an application where animation is a deliberate design element, this is justified.
- Overuse of animation can harm perceived performance and accessibility. The motion design system documented in `07_UI_System.md` constrains usage to high-value moments and respects `prefers-reduced-motion`.

**Future Evolution:** Framer Motion is the ecosystem standard for React animation. No migration is anticipated.

---

### 3.10 React Three Fiber

**Purpose:** A React renderer for Three.js, enabling declarative 3D graphics and visualisations within React component trees.

**Why Selected:** ScamShield AI's dashboard and scan result screens include 3D visualisations of threat networks, risk topology, and animated shield imagery that reinforce the platform's identity as a sophisticated AI security tool. React Three Fiber allows these 3D elements to be built with the same component model as the rest of the UI — state, props, hooks — without requiring a context switch to imperative Three.js code.

**Alternatives Considered:**
- *Three.js directly* — Full control, no abstraction overhead. Rejected because integrating Three.js with React's reconciler manually produces fragile lifecycle management code and cannot leverage React's state model.
- *Babylon.js* — A complete 3D engine. Heavier than Three.js and lacks the React ecosystem integration. Rejected as overengineered for the scope of 3D usage in ScamShield AI.
- *CSS 3D transforms* — Sufficient for simple perspective effects. Rejected for the specific visualisations required which exceed what CSS 3D can produce.

**Trade-offs:**
- React Three Fiber adds significant bundle weight. It is loaded lazily on pages that require 3D rendering; pages that do not require it pay no bundle cost.
- Three.js knowledge is required for non-trivial 3D work, even with React Three Fiber's abstraction.

**Future Evolution:** The library is actively maintained by Pmndrs, the same team behind Zustand. Its trajectory is stable. If 3D usage grows significantly, dedicated visualisation components may be extracted into a separate lazy-loaded module.

---

### 3.11 Drei

**Purpose:** A collection of ready-made React Three Fiber helpers and abstractions — cameras, controls, environments, shaders, and geometry utilities.

**Why Selected:** Drei eliminates the boilerplate involved in common Three.js patterns. Setting up an `OrbitControls`, an `Environment` lighting rig, or a `Float` animation in React Three Fiber requires multiple lines of imperative Three.js code. Drei reduces these to single component declarations. It is to React Three Fiber what Radix is to component primitives — a high-quality set of solved problems.

**Trade-offs:** Drei is tightly coupled to React Three Fiber's version. Upgrading one requires ensuring compatibility with the other. This is a minor but real maintenance consideration.

**Future Evolution:** Drei evolves in lock-step with React Three Fiber. No independent migration path exists; they are evaluated together.

---

### 3.12 Lucide Icons

**Purpose:** The icon library providing all UI iconography across the application.

**Why Selected:** Lucide Icons provides a consistent, clean, and well-designed set of stroke-based SVG icons with excellent TypeScript support. Each icon is individually importable, meaning tree-shaking ensures that only the icons actually used appear in the production bundle. The stroke-based design scales cleanly to any size and remains legible at small dimensions — essential for a data-dense security dashboard.

**Alternatives Considered:**
- *Heroicons* — Quality icons from the Tailwind team. A strong alternative. Lucide was chosen because its icon set is larger and better suited to the technical and security-specific iconography needed (network, shield, scan, threat icons).
- *Font Awesome* — The industry standard but historically delivered as a font, which prevents tree-shaking. The SVG variant addresses this but the free tier has licensing restrictions on some icons.
- *Phosphor Icons* — Excellent quality and TypeScript support. Lucide was preferred because of its broader community adoption in the React/Tailwind ecosystem.

**Trade-offs:** None significant. Icon libraries are low-risk decisions.

**Future Evolution:** If the design system evolves to require custom icons beyond Lucide's set, custom SVG components are added alongside Lucide rather than replacing it.

---

## 4. Backend Technologies

### 4.1 Node.js

**Purpose:** The runtime that executes all server-side TypeScript. Node.js provides the event loop, the HTTP primitives, and the module system that the Express server runs on top of.

**Why Selected:** Node.js shares the language (TypeScript) and many of the types (`shared/`) with the frontend. This eliminates the context switch between frontend and backend development and allows the same engineers to contribute to both. Node.js's non-blocking I/O model is well-suited to ScamShield AI's workload profile: the server makes many concurrent outbound calls to external APIs (Gemini, Safe Browsing, VirusTotal, WHOIS) and waits on responses. These are I/O-bound workloads, where Node.js's event loop excels. A CPU-bound language (Go, Rust) would not provide meaningful throughput advantages for this specific workload.

**Alternatives Considered:**
- *Python (FastAPI / Django)* — Natural for ML workloads. Rejected because the team's TypeScript expertise is higher and the AI integration is via API call (Gemini), not local model execution where Python's ML ecosystem would be advantageous.
- *Go* — Excellent concurrency and performance. Rejected because TypeScript sharing with the frontend, and the available team expertise, outweigh Go's performance advantages for this use case.
- *Bun* — A fast all-in-one JavaScript runtime. Promising, but not yet stable enough for production use in a security-critical context. Documented as a future migration candidate.

**Trade-offs:**
- Node.js is single-threaded. CPU-intensive synchronous work — large JSON parsing, complex synchronous computation — blocks the event loop. All such work in ScamShield AI is delegated to background workers via BullMQ.
- Node.js's package ecosystem (npm) has a history of supply-chain security incidents. Dependencies are audited with `npm audit` on every install and pinned in `package-lock.json`.

**Future Evolution:** Bun's performance improvements and compatibility with Node.js APIs make it a viable drop-in replacement in the future. No migration is planned until Bun's stability track record in production environments is established.

---

### 4.2 Express

**Purpose:** The HTTP framework. Express provides the server, the router, and the middleware pipeline that all API requests flow through.

**Why Selected:** Express is the most widely deployed Node.js HTTP framework. It is minimal, stable, and has no magic. Every middleware, every route, and every response is explicit in the code. This explicitness is a virtue for a security-sensitive platform where the request processing pipeline must be auditable and predictable. Express's ecosystem is vast: every authentication strategy, rate limiter, security header library, and file upload handler has an Express integration that is battle-tested.

Express's middleware model directly enables the layered security architecture defined in `02_Architecture.md`: Helmet, CORS, rate limiter, auth middleware, and validation middleware are composed in a deterministic order on every request.

**Alternatives Considered:**
- *NestJS* — A heavily opinionated, Angular-inspired framework with decorators, dependency injection, and a module system. Provides more structure out of the box. Rejected because its abstraction layers obscure the request pipeline, which is a liability for a security product where that pipeline must be inspectable. See comparison table in Section 9.
- *Fastify* — Higher throughput than Express with a schema-first validation model. A legitimate alternative for performance-critical APIs. Rejected because Express's ecosystem depth and team familiarity provide more value than Fastify's throughput advantage at current scale. Documented as a future migration candidate.
- *Hono* — Lightweight and edge-compatible. Excellent performance. Not yet a standard choice for complex backend applications. Rejected for MVP; revisit if edge deployment becomes a requirement.

**Trade-offs:**
- Express is unopinionated. Architectural discipline — the Route → Controller → Service → Repository pattern — must be enforced by the team rather than by the framework. This is why the Engineering Standards Handbook in `.agent/skills/scamshield-standards.md` is explicit about the four-layer pattern.
- Express 4 (the current stable version) uses callbacks internally, though modern code uses async/await with `express-async-errors`. Express 5 (beta) resolves this natively.

**Future Evolution:** Express 5 introduces native async/await support in middleware and error handling, eliminating the need for `express-async-errors`. Migration to Express 5 when it reaches stable release is low-risk and planned.

---

### 4.3 TypeScript (Backend)

The decision rationale is identical to Section 3.2. TypeScript is used on the backend for the same reasons as the frontend — static typing, IDE support, compile-time error catching — plus one additional benefit: the `shared/types/` package is consumed by both frontend and backend TypeScript, ensuring that API request and response shapes are identical on both sides without code duplication.

---

### 4.4 Zod

**Purpose:** The runtime schema validation library. Zod validates all external inputs — HTTP request bodies, query parameters, URL parameters, and environment variables — before they reach application logic.

**Why Selected:** TypeScript's type system operates at compile time. At runtime, the types disappear. An HTTP request body typed as `{ url: string }` in TypeScript is, at runtime, an unvalidated JavaScript object that could contain anything an attacker crafts. Zod bridges this gap: it validates the shape, type, and content of data at the application boundary and throws structured, descriptive errors when validation fails.

Zod schemas are also the single source of truth for request shapes. The same schema validates the request body, infers the TypeScript type for the handler function, and generates the error message returned to the client on failure. No duplication.

**Alternatives Considered:**
- *Joi* — Mature validation library. Rejected because Joi does not natively infer TypeScript types from schemas — type definitions must be written separately.
- *Yup* — Popular for form validation. Rejected because its TypeScript inference is weaker than Zod's and its performance is slower.
- *class-validator + class-transformer* — Decorator-based validation tied to classes. Rejected because decorators add complexity and the class-based model is a poor fit with the functional style of the rest of the backend.

**Trade-offs:**
- Zod's error messages are verbose by default. A transformation layer converts Zod errors to the `ValidationError` format expected by the centralised error handler before they reach the client.

**Future Evolution:** Zod v4 (released 2025) improves performance and reduces bundle size significantly. Migration is straightforward and planned.

---

### 4.5 JSON Web Tokens (JWT)

**Purpose:** The authentication token format. JWTs encode the user's identity and are verified on every protected API request without a database lookup.

**Why Selected:** JWTs enable stateless authentication: the server can verify a token's validity by checking its signature without querying a database for a session record. This means the authentication check adds zero database load as the user base scales. The token carries the `userId` and any role claims, which the service layer uses for authorisation checks.

The `jsonwebtoken` library on the backend signs tokens with a secret stored in the environment; the `jose` library is used for verification because it supports the Web Crypto API and is suitable for edge environments in the future.

**Alternatives Considered:**
- *Server-side sessions (express-session + Redis)* — Stateful sessions with a session store. Rejected for the MVP because they require a session store (additional Redis instance), add a database lookup on every request, and complicate horizontal scaling. Considered as a future addition for enterprise SSO where centralised session invalidation is required.
- *Paseto (Platform-Agnostic Security Tokens)* — A more modern alternative to JWT that eliminates several JWT algorithm confusion attack vectors. Technically superior security profile. Rejected because the ecosystem support and developer familiarity are significantly lower than JWT, adding implementation risk without proportional benefit at current scale.

**Trade-offs:**
- JWTs cannot be invalidated before they expire. If an access token is compromised, the 15-minute expiry limits the damage window. Refresh token rotation (single-use, stored hashed in the database) provides the session revocation mechanism for the longer-lived credential.
- JWT's flexibility (algorithm selection) has historically been exploited. ScamShield AI enforces `HS256` exclusively; the verification code rejects tokens with any other algorithm.

**Future Evolution:** If enterprise SSO (SAML, OIDC) becomes a requirement, the authentication layer is extended to support OAuth 2.0 / OIDC flows alongside the existing JWT authentication. The JWT format itself remains valid; the issuance mechanism adds external identity providers.

---

### 4.6 bcrypt

**Purpose:** The password hashing algorithm. bcrypt transforms a plaintext password into a cryptographic hash that is stored in the database. Password verification compares a plaintext attempt against the stored hash without ever storing or transmitting the plaintext.

**Why Selected:** bcrypt is the industry standard for password hashing. It incorporates a configurable work factor (cost parameter) that makes brute-force attacks computationally expensive. Increasing the cost factor in future (by re-hashing passwords on next login) keeps pace with hardware improvements without changing the hashing algorithm. bcrypt also automatically generates and incorporates a random salt per hash, preventing rainbow table attacks.

ScamShield AI uses a cost factor of 12. This adds approximately 250ms to login and registration operations — imperceptible to the user, but it means an attacker can attempt fewer than four hash comparisons per second on modern hardware.

**Alternatives Considered:**
- *Argon2* — The current OWASP recommendation for new applications. Technically superior to bcrypt in resistance to GPU-based attacks. Selected as the future migration target. Rejected for the MVP because `bcrypt`'s Node.js ecosystem support is more mature and the risk difference at a cost factor of 12 is not material for ScamShield AI's threat model.
- *PBKDF2* — NIST-recommended. Rejected because it is more vulnerable to GPU parallelisation than bcrypt at equivalent iteration counts.
- *scrypt* — Memory-hard, GPU-resistant. Rejected because the Node.js implementation is less battle-tested than bcrypt in production environments.

**Trade-offs:**
- bcrypt passwords are limited to 72 bytes; inputs beyond this length are silently truncated. Input validation enforces a maximum password length of 72 characters to make this truncation behaviour transparent.

**Future Evolution:** Migration to Argon2id is the planned path as it becomes the standard recommendation. Passwords can be migrated progressively — re-hash with Argon2id on next login.

---

### 4.7 Mongoose

**Purpose:** The MongoDB Object Document Mapper (ODM). Mongoose provides schema definitions, model classes, query builders, middleware hooks, and validation at the application layer for all MongoDB interactions.

**Why Selected:** Mongoose adds structure to MongoDB's schema-flexible documents. Defining schemas explicitly ensures that every document written to a collection has the expected fields, types, and constraints — even though MongoDB does not enforce this itself. Mongoose's middleware hooks (`pre('save')`, `post('find')`) are used for cross-cutting concerns: automatically setting `updatedAt`, enforcing soft-delete filtering on queries, and hashing passwords before insertion.

Mongoose's TypeScript support (via `@types/mongoose` and Mongoose's own generics) produces fully typed model instances and query results, which propagates type safety from the database layer upward through repositories and services.

**Alternatives Considered:**
- *Prisma* — A modern ORM with a schema file, migrations, and excellent TypeScript support. Primarily targets SQL databases but has MongoDB support. Rejected because Prisma's MongoDB adapter lacks some features (transactions, aggregation pipeline) available through Mongoose, and because Prisma's migration model is less natural for MongoDB's schema-flexible use case.
- *Raw MongoDB Node.js driver* — Maximum control, no abstraction overhead. Rejected because the ODM features of Mongoose (schema validation, middleware, populated references) are valuable enough to justify the abstraction.

**Trade-offs:**
- Mongoose adds a thin abstraction over the MongoDB driver. Queries written with Mongoose are slightly less performant than raw driver queries, though the difference is negligible for CRUD operations.
- Mongoose's `populate()` for resolving document references is less efficient than an aggregation pipeline for complex queries. Complex reporting queries use the aggregation pipeline directly.

**Future Evolution:** Mongoose is actively maintained and is the community standard for MongoDB with Node.js. No migration is anticipated unless the database itself changes.

---

### 4.8 Multer

**Purpose:** Middleware for handling multipart form data, specifically file uploads. Multer processes image uploads for the Image Scanner and QR Scanner features.

**Why Selected:** Multer is the standard Express file upload middleware. It parses `multipart/form-data` requests, validates file types and sizes, and provides the uploaded file buffer in `req.file` for downstream processing. Its in-memory storage option is used for ScamShield AI: files are held in memory just long enough to be uploaded to Cloudinary, then discarded without touching the local filesystem.

**Trade-offs:**
- In-memory storage limits the maximum usable file size to what is safe to hold in a Node.js process's heap. The 10 MB limit configured in Multer ensures that large files cannot cause memory exhaustion. Files are never written to disk, which eliminates the risk of local filesystem exposure.

---

### 4.9 Helmet

**Purpose:** Security header middleware. Helmet sets a collection of HTTP response headers that protect against common web vulnerabilities.

**Why Selected:** Helmet is applied globally as the first middleware in the Express pipeline, before any routing occurs. It sets: `Content-Security-Policy` to restrict resource origins, `Strict-Transport-Security` to enforce HTTPS, `X-Frame-Options` to prevent clickjacking, `X-Content-Type-Options` to prevent MIME sniffing, and `Referrer-Policy` to control referrer information leakage. Each of these headers closes a documented attack vector at zero implementation cost.

For a security platform, failing to set these headers is not a reasonable trade-off. Helmet is a non-negotiable baseline.

**Trade-offs:** The Content Security Policy requires careful tuning to allow the specific external resources the application loads (Cloudinary image CDN, Google Fonts). An overly restrictive CSP breaks features; an overly permissive one reduces protection. The CSP is maintained in `server/src/config/helmet.config.ts` and updated when new external resources are introduced.

---

### 4.10 Morgan

**Purpose:** HTTP request logging middleware. Morgan writes a structured log line for every HTTP request processed by the Express server.

**Why Selected:** Request logging is a baseline operational requirement. Morgan provides a minimal, configurable HTTP access log without requiring custom code. The `dev` format is used in development for human-readable output; a custom JSON format aligned with the structured logging standard is used in production, ensuring that log lines include `requestId`, method, path, status code, and response time.

**Trade-offs:** Morgan logs requests at the middleware level, which means it logs requests that fail before reaching a controller (e.g., validation errors). This is correct behaviour — all requests should be logged regardless of outcome.

---

### 4.11 Express Rate Limit

**Purpose:** Request throttling middleware. Limits the number of requests a client can make to specific endpoints within a time window.

**Why Selected:** Rate limiting is a foundational defence against brute-force attacks (password guessing), credential stuffing, denial-of-service attempts, and API scraping. Different endpoints carry different risk profiles and are rate-limited independently. Authentication endpoints (`/login`, `/register`, `/forgot-password`) use a strict limit (10 requests per 15 minutes per IP). Scan endpoints use a more permissive limit calibrated to legitimate user behaviour. The health endpoint is exempt.

**Alternatives Considered:**
- *upstash/ratelimit* — Redis-backed, works across multiple server instances. Selected as the future upgrade path because `express-rate-limit`'s default in-memory store does not share state across multiple server instances in a scaled deployment.

**Future Evolution:** Migrate to a Redis-backed rate limiter when horizontal scaling requires rate limit state to be shared across instances.

---

### 4.12 CORS

**Purpose:** Cross-Origin Resource Sharing configuration. Controls which origins are permitted to make requests to the backend API.

**Why Selected:** The browser's same-origin policy prevents frontend JavaScript from making requests to a different origin without explicit permission from the server. The CORS middleware configures the Express server's response to CORS preflight requests, specifying the allowed origins, methods, and headers.

ScamShield AI's CORS configuration allows only the specific frontend domain and the Chrome extension's origin. `origin: '*'` is explicitly prohibited in production. The allowed origins are loaded from the `ALLOWED_ORIGINS` environment variable, which can be updated per environment without a code change.

---

## 5. Database

### 5.1 MongoDB

**Purpose:** The primary data store for all application data: user accounts, scan records, analysis results, and session metadata.

**Why Selected:** MongoDB's document model is a natural fit for scan records, which have heterogeneous structures depending on scan type. A URL scan record contains different fields than an image scan record. In a relational database, this would require a complex table inheritance scheme or a JSONB column. In MongoDB, each scan type's record is a document with its own shape, all stored in the same collection and differentiated by a `scanType` field. This makes querying, indexing, and schema evolution dramatically simpler during a period when the scan record format is actively being developed.

MongoDB's aggregation pipeline provides the analytics and reporting capabilities needed for the dashboard (scan counts by type, risk distribution over time) without requiring a separate analytics database.

**Alternatives Considered:**
- *PostgreSQL* — The strongest relational alternative. Excellent for structured, relational data with complex joins and transactional guarantees. See comparison table in Section 9. Documented as a future addition for relational reporting data (billing, enterprise audit logs) rather than a replacement.
- *SQLite (via Turso)* — Appropriate for small, single-user applications. Rejected because it does not support the concurrent write patterns and horizontal scaling required for a multi-user platform.
- *DynamoDB* — AWS-managed, highly scalable key-value + document store. Rejected because its query model is restrictive for the ad-hoc query patterns (filter by userId, sort by timestamp, range queries on risk score) used in scan history retrieval.

**Trade-offs:**
- MongoDB's flexible schema is a benefit during development but a liability if schema discipline is not enforced at the application level. Mongoose schemas enforce this discipline.
- MongoDB does not support multi-document transactions with the same guarantees as ACID-compliant SQL databases. Operations that must be atomic are designed to use MongoDB's single-document atomicity where possible.

### 5.2 MongoDB Atlas

**Purpose:** The managed cloud hosting platform for MongoDB. Atlas handles provisioning, replication, backups, monitoring, and upgrades.

**Why Selected:** Running a self-hosted MongoDB cluster requires dedicated operational expertise: replica set management, backup configuration, security hardening, and version upgrades are all ongoing work. Atlas provides all of this as a managed service, freeing engineering time for product development. Atlas's free tier is sufficient for early development; the M10 tier provides a 3-node replica set appropriate for production.

Atlas also provides Atlas Search (Lucene-based full-text search), which will power the scan history search feature without a separate Elasticsearch deployment.

**Future Evolution:** If cost or compliance requirements make Atlas unsuitable, migration to a self-hosted MongoDB replica set on cloud infrastructure (EC2, GCE) is straightforward since Atlas uses standard MongoDB. The application code does not change.

### 5.3 Why NoSQL Over SQL

The decision to use MongoDB over a relational database was not a default choice — it was evaluated against PostgreSQL specifically. The deciding factors:

| Factor | MongoDB | PostgreSQL |
|--------|---------|-----------|
| Schema flexibility for heterogeneous scan records | Native | Complex (JSONB or table inheritance) |
| Speed of schema evolution during development | Fast (no migrations) | Slower (migrations required for every change) |
| Document model fit for scan records | Natural | Forced relational mapping |
| Aggregation pipeline for analytics | Native | SQL (equivalent capability) |
| Relational data (users, billing, audit logs) | Manageable with references | Natural fit |
| ACID transactions | Limited (single-document) | Full |
| Full-text search | Atlas Search | pg_trgm / pg_fts |

For the specific data structures and query patterns of ScamShield AI's core features, MongoDB provides a better fit. If strict relational data (billing, enterprise multi-tenancy audit trails) becomes a significant portion of the data model, PostgreSQL is added as a secondary database for those specific use cases.

### 5.4 Indexing Philosophy

Every query pattern is indexed. Indexes are declared in the Mongoose schema, not applied manually via MongoDB shell commands. This ensures index definitions are version-controlled, reviewed in PRs, and applied consistently across environments. Compound indexes are added for the specific field combinations used in common queries. Indexes are reviewed when query patterns change.

The `isDeleted` field is included in compound indexes on every collection to prevent full collection scans in soft-delete filtering.

---

## 6. AI Stack

### 6.1 Gemini API (Google)

**Purpose:** The primary AI reasoning engine. Gemini processes assembled prompts containing scan content and pre-extracted threat signals, reasons over them using large language model capabilities, and returns structured risk assessments.

**Why Selected:** Gemini models are selected over alternatives based on four criteria: reasoning quality on adversarial content, context window size (up to 1 million tokens in Gemini 1.5 Pro), structured JSON output mode, and pricing at the expected scan volume. Gemini's JSON output mode guarantees that model responses conform to a specified schema, which eliminates the parse-and-retry loop that free-form text generation requires.

Google's API infrastructure provides the reliability guarantees appropriate for a production security platform. Google's own Safe Browsing data is also used at the signal aggregation layer, making Gemini a natural integration within the Google AI ecosystem.

**Alternatives Considered:**
- *OpenAI GPT-4o* — Strong reasoning capability and well-established API. See comparison table in Section 9. Rejected in favour of Gemini's larger context window and JSON mode. Documented as the primary fallback provider if Gemini experiences availability issues.
- *Anthropic Claude* — Excellent reasoning and instruction following. A strong alternative. Not selected as primary because Gemini's structured output mode and context window were superior at the time of evaluation.
- *Open-source models (Llama, Mistral)* — Self-hosted option that eliminates per-call API costs. Rejected for the MVP because self-hosting capable models requires GPU infrastructure that is not justified at early stage. Documented as a future cost-optimisation path for high-volume, lower-complexity scans.

**Trade-offs:**
- Gemini API calls are subject to rate limits and pricing per token. The caching layer described in `02_Architecture.md` §6.3 mitigates cost by avoiding redundant API calls for identical scan content.
- Reliance on a third-party AI provider introduces availability risk. The scan pipeline's graceful degradation mode — returning signal-only results when the AI is unavailable — manages this risk.

**Provider Abstraction:** The Gemini client is encapsulated in `server/src/lib/gemini.client.ts`. The AI pipeline calls a typed interface, not the Gemini SDK directly. Swapping to a different provider requires changing only `gemini.client.ts`; no pipeline logic changes.

**Future AI Providers:** OpenAI as a fallback, Anthropic for specific use cases requiring strong instruction following, and self-hosted Llama or Mistral for cost-sensitive high-volume scans are all documented migration paths.

---

### 6.2 OCR Service

**Purpose:** Optical character recognition. Extracts text from uploaded images so that the AI pipeline can analyse the content of screenshots, document photos, and image-based scam content.

**Why Selected:** OCR is required for the Image Scanner feature. Rather than self-hosting an OCR engine (Tesseract), a cloud-hosted OCR API is used to avoid running compute-intensive workloads on the primary application server. The specific provider is configurable via environment variable, and the client is abstracted behind `server/src/lib/ocr.client.ts`.

**Alternatives Considered:**
- *Google Cloud Vision API* — High accuracy, strong language support. The primary candidate given the Google ecosystem alignment.
- *AWS Textract* — Excellent for document-structured OCR. More capable than needed for the image-based scam text extraction use case.
- *Tesseract (self-hosted)* — Free, open-source, no per-call cost. Rejected for production because accuracy is lower than cloud providers on noisy or compressed images, and self-hosting requires dedicated compute.

**Future Evolution:** The OCR provider is selected and updated via environment configuration with no code changes required.

---

### 6.3 Google Safe Browsing API

**Purpose:** URL threat intelligence. Provides real-time lookup of URLs against Google's database of known phishing pages, malware distribution sites, and unwanted software.

**Why Selected:** Google Safe Browsing has been built and refined over more than fifteen years. It is the threat intelligence signal with the highest recall for known-bad URLs — covering the broadest set of phishing and malware domains of any single provider. It is available via a documented API, has a generous free tier, and returns results with sub-500ms latency for the vast majority of queries.

**Trade-offs:** Safe Browsing covers known threats. Novel phishing pages created within the last few hours or days may not yet appear in the database. This is why AI analysis — which can identify structural and linguistic indicators of fraud independent of reputation — is the primary detection mechanism, with Safe Browsing as one corroborating signal.

---

### 6.4 VirusTotal

**Purpose:** Multi-engine URL and domain reputation analysis. VirusTotal aggregates results from 70+ antivirus engines and security vendors for a given URL or domain, providing a consensus view of reputation.

**Why Selected:** No single threat intelligence source covers the full threat landscape. VirusTotal's aggregation model provides coverage breadth that Safe Browsing alone cannot match. A URL that passes Safe Browsing but receives detections from multiple VirusTotal vendors is a meaningful risk signal. VirusTotal integration is configured as optional — the system functions without it — to allow deployment in environments where VirusTotal access is restricted by licensing.

**Trade-offs:** The free VirusTotal API tier is rate-limited to 4 requests per minute. A local cache layer avoids re-querying the same URL within a 1-hour window, making the free tier sufficient for early stage traffic volumes. The commercial API license is the planned upgrade path.

---

### 6.5 WHOIS / RDAP

**Purpose:** Domain registration data. Provides the registration date, registrar, and registrant organisation for a domain name.

**Why Selected:** Domain age is one of the most reliable structural risk indicators for phishing. Domains registered within the last 30 days are statistically overrepresented in phishing campaigns because attackers must continuously rotate infrastructure as domains are blocklisted. A domain that is two days old and impersonating a major bank is a strong fraud signal regardless of its content.

RDAP (Registration Data Access Protocol) is the modern, structured JSON successor to WHOIS. ScamShield AI queries RDAP first and falls back to WHOIS parsing for registrars that have not yet migrated. Results are cached for 24 hours per domain since registration data changes infrequently.

---

### 6.6 Cloudinary

**Purpose:** Cloud image storage and transformation for user-uploaded images. Images uploaded via the Image and QR scanners are temporarily hosted on Cloudinary before being processed by OCR.

**Why Selected:** Cloudinary provides managed image storage with a CDN, transformation pipeline (resize, normalise, compress), and an auto-expiry policy. Images are uploaded with a 24-hour time-to-live. After expiry, they are deleted automatically — no cleanup job required. The CDN ensures that the OCR service receives the image over a fast, geographically distributed connection.

Cloudinary's free tier is generous and its SDK has first-class Node.js support.

**Trade-offs:** Temporary user images are processed and stored by a third-party service, which is a privacy consideration. The privacy policy discloses this. The 24-hour auto-expiry minimises the data retention window.

**Future Evolution:** At high volume, Cloudinary's egress costs may justify migration to S3-compatible self-hosted storage. The Cloudinary client is abstracted behind `server/src/lib/cloudinary.client.ts`, making this migration low-impact.

---

## 7. Development Tools

### 7.1 Git

**Purpose:** Version control for all source code, documentation, and configuration.

Every change to the codebase is tracked, attributed, and reversible. Git's branching model supports the feature branch workflow defined in the engineering standards: `main` is always production-ready, features develop in isolation, and merges happen through reviewed pull requests. The commit history is the authoritative record of why the codebase is the way it is.

---

### 7.2 GitHub

**Purpose:** Remote repository hosting, pull request reviews, branch protection, and CI/CD pipeline trigger.

GitHub provides the collaboration infrastructure: branch protection rules ensure that `main` cannot receive direct pushes; pull requests require at least one review before merging; CI checks must pass before a PR can be merged. The `.github/` directory in the repository contains workflow definitions, issue templates, and pull request templates that enforce process consistency.

---

### 7.3 ESLint

**Purpose:** Static analysis for TypeScript and JavaScript. ESLint enforces code quality rules and catches potential bugs before they reach review or production.

**Why Essential:** ESLint operates on the AST level, catching patterns that TypeScript's type checker misses: unused variables, unreachable code, unsafe use of `any`, missing `await` on async functions, and violations of the project's coding conventions. The ESLint configuration extends `@typescript-eslint/recommended` with additional rules specific to ScamShield AI's standards. Rules are treated as errors, not warnings — linting failures block commits.

---

### 7.4 Prettier

**Purpose:** Opinionated code formatter. Prettier reformats all TypeScript, CSS, JSON, and Markdown files to a consistent style automatically.

**Why Essential:** Formatting debates waste review time. Prettier eliminates them entirely. The configuration is minimal — `printWidth`, `singleQuote`, `trailingComma` — and applied uniformly. No reviewer ever comments on indentation or quote style.

Prettier and ESLint are configured to not conflict with each other via `eslint-config-prettier`, which disables ESLint's formatting rules in favour of Prettier's output.

---

### 7.5 Husky

**Purpose:** Git hooks manager. Husky runs scripts at specific points in the git workflow — primarily on `pre-commit` and `commit-msg`.

**Why Essential:** Automated checks that run in CI only are too late. If a developer pushes broken code or a malformed commit message, the CI failure is discovered minutes later when the feedback loop has already been broken. Husky runs ESLint, Prettier checks, and commit message validation at commit time, before the code leaves the developer's machine. Issues are surfaced in seconds rather than minutes.

---

### 7.6 lint-staged

**Purpose:** Runs linting and formatting only on files staged for commit, not the entire codebase.

**Why Essential:** Running ESLint and Prettier across the entire codebase on every commit is slow and unnecessary. lint-staged runs the configured tools only against the files in the current commit's staging area. This keeps the `pre-commit` hook fast (under 2 seconds for typical changesets) while maintaining the quality guarantee.

---

### 7.7 Visual Studio Code

**Purpose:** The primary code editor for the engineering team.

VS Code's first-class TypeScript support — IntelliSense, go-to-definition, rename refactoring, inline error display — is unmatched among editors. The workspace configuration in `.vscode/` enforces consistent settings across the team: the same formatter on save, the same ESLint integration, and the same extension recommendations. Engineers who open the repository in VS Code get a correctly configured development environment without any manual setup.

---

### 7.8 Claude Code

**Purpose:** AI-assisted software engineering. Claude Code is the primary AI collaborator for code generation, architecture review, documentation, and debugging.

**Why Essential:** Claude Code is not a code completion tool — it is a reasoning partner that understands the full context of ScamShield AI's architecture, standards, and design decisions as documented in this repository's `.agent/skills/` and `.agent/workflows/` directories. It generates production-quality code that conforms to the engineering standards, suggests architectural improvements, writes and updates documentation, and reviews changes for security issues before they are committed.

The `.agent/skills/scamshield-standards.md` file is the instructions document that Claude Code references for every task performed on this project. This ensures that AI-assisted contributions are consistent with human-written code.

---

### 7.9 Antigravity

**Purpose:** The AI development environment that hosts Claude Code and the project's agent workflows and skills.

Antigravity provides the infrastructure through which `.agent/skills/` and `.agent/workflows/` are defined and executed. The workflow files in `.agent/workflows/` represent repeatable engineering operations — code review, simplification, hardening, UI critique — that can be invoked consistently across sessions.

---

## 8. Deployment Stack

### 8.1 Vercel (Frontend)

**Purpose:** Static hosting and CDN delivery for the React frontend.

**Why Selected:** The React application is built to a static bundle of HTML, CSS, and JavaScript. Vercel serves this bundle from its global CDN, meaning users receive the frontend from a geographically nearby edge server with sub-50ms response times. Vercel's preview deployment feature automatically deploys every pull request to a unique URL, enabling reviewers to test changes in a production-like environment before merging. Zero-configuration deployment from the GitHub repository makes Vercel operationally low-overhead.

**Trade-offs:** Vercel is a managed platform with pricing tied to bandwidth and function execution. At high volume, egress costs are a consideration. A self-hosted CDN (Cloudfront + S3) is the migration path if cost justifies the operational overhead.

---

### 8.2 Render (Backend)

**Purpose:** Managed Node.js hosting for the Express backend API and BullMQ workers.

**Why Selected:** Render provides managed Node.js service hosting with automatic deployments from GitHub, persistent disks, private networking between services, health check integration, and environment variable management. Render's free tier is sufficient for early development; the paid tier provides dedicated resources, zero-downtime deployments, and SLA-backed uptime. The worker processes run as separate Render services that can be scaled independently of the API service.

**Alternatives Considered:**
- *Railway* — Similar managed Node.js hosting with a simpler pricing model. A valid alternative. Render was preferred for its more mature documentation and established track record.
- *AWS Elastic Beanstalk / App Runner* — AWS-native managed hosting. Rejected for the MVP because the operational complexity and configuration overhead are not justified at early stage.
- *Fly.io* — Edge-distributed deployment. Compelling for latency-sensitive APIs. Retained as a future migration candidate.

**Future Evolution:** At significant scale, containerised deployment (Docker + Kubernetes or AWS ECS) provides more control over resource allocation and rollout strategies. See Section 8.5 and 8.6.

---

### 8.3 MongoDB Atlas (Database Hosting)

Documented in Section 5.2. Atlas handles all database infrastructure. No separate hosting decision is required.

---

### 8.4 Cloudinary (Media Hosting)

Documented in Section 6.6. Cloudinary handles all temporary image storage. No separate hosting decision is required.

---

### 8.5 Future: Docker

When the platform grows to require consistent environments across development, staging, and production, Docker containerisation provides the solution. Each service — API, workers, the future notification service — runs in its own container with a declared set of dependencies. The development environment is reproduced exactly in production. Rollbacks are a matter of redeploying a previous image tag.

Docker is not introduced in the MVP because Render's managed environment provides equivalent consistency at lower operational overhead for the current team size and traffic volume.

---

### 8.6 Future: Kubernetes

Kubernetes becomes the deployment target when the platform requires fine-grained control over service scaling, rolling deployments, canary releases, and multi-region availability. Specifically, the triggers for Kubernetes adoption are: the need to scale the AI worker pods independently of the API pods based on queue depth, the need for automated failover across availability zones, and team size that can sustain the operational overhead of a Kubernetes cluster.

The migration path from Render to Kubernetes is straightforward because the application code is already containerisable — no platform-specific APIs are used.

---

## 9. Comparison Tables

### 9.1 React vs. Next.js

| Dimension | React (SPA) | Next.js (SSR/SSG) |
|-----------|-------------|-------------------|
| Rendering | Client-side only | Server-side, static, or hybrid |
| SEO | Requires prerendering for public pages | Native server-rendered HTML |
| Initial page load | Slower (JS must execute first) | Faster (HTML arrives pre-rendered) |
| Deployment model | Static files on CDN | Node.js server required |
| Complexity | Lower | Higher |
| Routing | Manual (React Router) | File-system based |
| Data fetching | TanStack Query | Server Components + `fetch` |
| **Verdict for MVP** | **Selected** — authenticated app, SEO not required | Future path if public-facing pages need SEO |

---

### 9.2 Express vs. NestJS

| Dimension | Express | NestJS |
|-----------|---------|--------|
| Philosophy | Minimal, un-opinionated | Opinionated, Angular-inspired |
| Learning curve | Low | High (decorators, DI, modules) |
| Boilerplate | Low | High |
| Request pipeline visibility | Explicit and auditable | Abstracted behind decorators |
| TypeScript support | Manual setup | Native, first-class |
| Ecosystem maturity | Extremely mature | Mature |
| Testability | Good | Very good (DI aids unit testing) |
| Architectural enforcement | Manual (team standards) | Framework-enforced |
| **Verdict for MVP** | **Selected** — auditable pipeline is a security requirement | Consider for future large-team projects |

---

### 9.3 MongoDB vs. PostgreSQL

| Dimension | MongoDB | PostgreSQL |
|-----------|---------|-----------|
| Schema model | Flexible (schema-per-document) | Rigid (schema-per-table) |
| Schema evolution | No migrations required | Migrations required for every change |
| Heterogeneous data (scan types) | Natural fit | Complex (JSONB or table inheritance) |
| ACID transactions | Single-document only | Full multi-row, multi-table |
| Relational data | Managed via references | Native joins |
| Full-text search | Atlas Search (Lucene) | pg_trgm, tsvector |
| Aggregation / analytics | Aggregation pipeline | SQL (equivalent capability) |
| Horizontal scaling | Native sharding | Extension required (Citus) |
| Operational maturity | High (with Atlas) | High |
| **Verdict for MVP** | **Selected** — scan data heterogeneity favours document model | Consider adding for relational analytics data |

---

### 9.4 Zustand vs. Redux

| Dimension | Zustand | Redux Toolkit |
|-----------|---------|---------------|
| Bundle size | ~1 KB | ~12 KB |
| API complexity | Minimal (`create` + slice) | Moderate (slices, selectors, thunks) |
| Boilerplate | Very low | Low (vs. legacy Redux), still higher than Zustand |
| DevTools | Via middleware | Native Redux DevTools |
| Mental model | Simple store + actions | Flux pattern |
| Performance | Subscription-based, no re-render on unused state | Equivalent with `useSelector` |
| Server state integration | Used alongside TanStack Query | RTK Query handles server state |
| **Verdict for MVP** | **Selected** — client state volume does not justify Redux overhead | Reconsider if global state complexity grows significantly |

---

### 9.5 REST vs. GraphQL

| Dimension | REST | GraphQL |
|-----------|------|---------|
| Response shape | Server-defined | Client-defined |
| Over-fetching | Common (fixed response shape) | Eliminated (client requests fields) |
| Under-fetching | Resolved with multiple requests | Single request for related data |
| Caching | Native HTTP caching (ETags, Cache-Control) | Complex (requires client-side cache normalisation) |
| Type safety | Via Zod + shared types | Via generated types from schema |
| Learning curve | Low | Moderate |
| Tooling | Universal | Requires Apollo / urql / React Query adapter |
| Suited to | Well-defined, stable APIs | Flexible, data-driven UIs with complex queries |
| **Verdict for MVP** | **Selected** — stable API contract fits the scan-request/response model | Future consideration if dashboard queries become complex |

---

### 9.6 Gemini vs. OpenAI

| Dimension | Gemini (Google) | OpenAI GPT-4o |
|-----------|-----------------|----------------|
| Context window | Up to 1M tokens (Gemini 1.5 Pro) | 128K tokens (GPT-4o) |
| Structured JSON output | Native JSON mode | Native JSON mode |
| Reasoning capability | Excellent | Excellent |
| Multimodal support | Yes (text, image, audio, video) | Yes (text, image) |
| API reliability | Google infrastructure | OpenAI infrastructure |
| Pricing (per million tokens) | Competitive | Comparable |
| Ecosystem integrations | Strong (within Google ecosystem) | Broader third-party ecosystem |
| Rate limits | Generous | Plan-dependent |
| **Verdict for MVP** | **Selected** — context window and Google ecosystem alignment | Primary fallback provider; OpenAI client is documented in provider abstraction |

---

## 10. Decision Log

| Decision | Status | Reason |
|----------|--------|--------|
| **React** as frontend framework | Approved | Component model, ecosystem depth, TypeScript integration, team familiarity |
| **Express** as backend framework | Approved | Minimal, auditable request pipeline; critical for a security product; broad ecosystem |
| **MongoDB** as primary database | Approved | Document model suits heterogeneous scan record structures; Atlas provides managed infrastructure |
| **REST** as API style | Approved | Stable, well-understood API contract between scanner features; HTTP caching semantics apply cleanly |
| **Gemini** as AI provider | Approved | Superior context window for large email/document scans; JSON output mode; Google ecosystem alignment |
| **TailwindCSS** for styling | Approved | Design system enforcement via `tailwind.config.js`; utility classes eliminate naming and specificity conflicts |
| **Zod** for validation | Approved | Runtime schema validation at application boundaries; TypeScript type inference from schema definitions |
| **JWT + HTTP-only cookies** for authentication | Approved | Stateless, scalable; HTTP-only cookie eliminates XSS token theft vector |
| **BullMQ + Redis** for job queue | Approved | Prevents long-running AI and image processing from blocking the API response cycle |
| **Vercel** for frontend hosting | Approved | Zero-config CDN deployment; preview URLs per PR; generous free tier |
| **Render** for backend hosting | Approved | Managed Node.js with GitHub deployment integration; worker service support; lower ops overhead vs. AWS |
| **TypeScript strict mode** across all source files | Approved | Eliminates implicit `any`, prevents runtime type errors, enforces explicit return types |
| **Bcrypt cost factor 12** | Approved | Balances security (computational expense per hash) against UX (250ms per login is imperceptible to users) |
| **Cloudinary** for temporary image storage | Approved | Auto-expiry eliminates cleanup jobs; CDN pre-processing for OCR; no persistent user data retained |
| **React Three Fiber** for 3D visualisations | Approved | Declarative 3D within React's component model; loaded lazily; zero cost on non-3D pages |

---

## 11. Future Technology Evolution

### Version 2: Performance and Scale

When user volume grows and performance becomes a measurable concern, the following technology evolutions are planned:

- **Redis as AI result cache**: Replaces the in-memory cache with a shared, persistent cache across multiple backend instances.
- **Fastify** replaces Express if API throughput becomes a bottleneck. The Route → Controller → Service → Repository pattern is framework-agnostic.
- **PostgreSQL** is added as a secondary database for relational analytics data, billing records, and enterprise audit logs. MongoDB remains the primary scan record store.
- **Argon2id** replaces bcrypt as the password hashing algorithm on a progressive re-hash-on-login basis.
- **Redis-backed rate limiting** replaces in-memory rate limiting to enforce limits consistently across multiple API instances.

### Version 3: Platform Expansion

When the platform expands to mobile, enterprise, and developer API tiers:

- **React Native** (Expo) for the mobile application, sharing component logic and TypeScript types with the web application via the `shared/` package.
- **Next.js** migration for the web frontend, adding server-side rendering for public-facing SEO pages (marketing, public threat reports) while retaining the SPA experience for authenticated users.
- **TanStack Router** as a type-safe routing alternative to React Router, evaluated once it reaches v1 stability.
- **OAuth 2.0 / OIDC** for enterprise SSO, added alongside the existing JWT authentication without replacing it.
- **Dedicated API Gateway** (Kong or AWS API Gateway) separating authentication, rate limiting, and routing from the application code.

### Version 4: Self-Hosted AI and Global Scale

- **Self-hosted open-weight models** (Llama, Mistral) for high-volume, cost-sensitive scan types where the quality difference vs. Gemini is acceptable.
- **Kubernetes** for container orchestration, enabling independent scaling of API pods and AI worker pods based on queue depth.
- **Multi-region deployment** with MongoDB Atlas Global Clusters and edge-deployed API services for sub-100ms response times globally.
- **OpenTelemetry** distributed tracing across all services, replacing the current request-ID-based log correlation with end-to-end trace visualisation.

---

## 12. Conclusion

The technology stack documented in this record was assembled with a single governing principle: every choice must serve the product's mission — making professional AI-powered cybersecurity accessible to everyone — without introducing unnecessary complexity, risk, or maintenance burden.

The frontend stack (React, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Framer Motion) provides a fast, maintainable, and visually capable foundation for a consumer-facing security product. The backend stack (Node.js, Express, TypeScript, Zod, JWT, bcrypt, Mongoose) provides a secure, auditable, and scalable API layer where every security control is explicit and reviewable. The AI stack (Gemini, Safe Browsing, VirusTotal, WHOIS, Cloudinary, OCR) gives ScamShield AI the analytical capability to detect threats that pattern-matching tools miss.

No choice in this record is permanent. Every entry in the Decision Log includes a documented evolution path. The goal is not to lock the project into today's best decisions — it is to make today's best decisions explicitly, for reasons that future engineers can evaluate, challenge, and improve.

---

| | |
|---|---|
| **Document Status** | Approved |
| **Version** | 1.0 |
| **Owner** | Engineering Team |
| **Next Document** | [04_FolderStructure.md](./04_FolderStructure.md) |
