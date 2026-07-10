# ScamShield AI

AI-powered multi-modal scam detection platform. Analyse URLs, emails, SMS messages, images, and QR codes for phishing, smishing, and social engineering threats.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| State | TanStack Query (server state), Zustand (client state) |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | MongoDB (Mongoose) |
| AI | Gemini API (Google) |
| Auth | JWT (access token in memory) + HTTP-only refresh cookie |
| Queue | BullMQ + Redis |

---

## Folder Structure

```
ScamShield-AI/
├── client/          # React SPA
├── server/          # Express API
├── shared/          # Shared TypeScript types, constants, utilities
├── docs/            # Architecture, API contracts, design decisions
├── assets/          # Static media
├── prompts/         # AI prompt templates
├── scripts/         # Automation utilities
└── .agent/          # Claude Code skills and workflows
```

---

## Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
# Install root dev tools
npm install

# Install client dependencies
npm install --prefix client

# Install server dependencies
npm install --prefix server
```

### Environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` with your API keys (see `.env.example` for all required variables).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server concurrently |
| `npm run dev:client` | Start Vite dev server only (port 5173) |
| `npm run dev:server` | Start Express server only (port 5000) |
| `npm run build` | Build client and server for production |
| `npm run format` | Format all files with Prettier |

### Per-package scripts

```bash
# Client
npm --prefix client run type-check   # TypeScript check
npm --prefix client run lint          # ESLint

# Server
npm --prefix server run type-check   # TypeScript check
npm --prefix server run lint          # ESLint
```

---

## API

Health check: `GET http://localhost:5000/api/v1/health`

Full API reference: [`docs/06_API.md`](./docs/06_API.md)

---

## Documentation

| Document | Contents |
|----------|---------|
| [`docs/01_Vision.md`](./docs/01_Vision.md) | Product vision and mission |
| [`docs/02_Architecture.md`](./docs/02_Architecture.md) | System architecture |
| [`docs/03_TechStack.md`](./docs/03_TechStack.md) | Technology decisions |
| [`docs/04_FolderStructure.md`](./docs/04_FolderStructure.md) | Repository layout |
| [`docs/05_Database.md`](./docs/05_Database.md) | Database schema |
| [`docs/06_API.md`](./docs/06_API.md) | REST API reference |
| [`docs/07_UI_System.md`](./docs/07_UI_System.md) | UI design system |
| [`docs/09_AI.md`](./docs/09_AI.md) | AI pipeline architecture |
