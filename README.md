<div align="center">

<img src="assets/images/logo.png" alt="ScamShield AI Logo" width="80" height="80" />

# ScamShield AI

### AI-Powered Multi-Modal Scam Detection Platform

Analyse URLs, emails, SMS messages, QR codes, and images for phishing,  
smishing, and social engineering threats — with plain-English AI explanations.

<br />

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb&logoColor=white)

</div>

---

## ✨ Project Highlights

| | |
|---|---|
| 🛡️ **Multi-Scanner Platform** | URL, Email, SMS, QR Code, and OCR image scanning in a single unified interface |
| 🤖 **AI-Powered Analysis** | Groq LLM reasoning over scan content, producing structured risk assessments |
| 💬 **Plain-English Explanations** | Every risk score is explained in language non-technical users understand |
| 📊 **Threat Analytics Dashboard** | Visualise scan history, risk distribution, and detection trends over time |
| 📜 **Scan History & Insights** | Searchable history log with per-scan AI explain on demand |
| 🔐 **Secure by Design** | JWT access tokens in memory, HTTP-only refresh cookies, bcrypt hashing, Zod validation |
| 🎨 **Premium Dark UI** | Framer Motion animations, custom design tokens, responsive across all breakpoints |
| ⚡ **Production Architecture** | Feature-module monorepo, typed API layer, centralised error handling, soft deletes |

---

## Overview

### The Problem

Scams are becoming increasingly sophisticated. AI-generated phishing emails, lookalike domains, smishing attacks via SMS, and QR code hijacking are now indistinguishable from legitimate communications to the average user. Existing tools either require technical expertise to use, operate on a single channel only, or provide a binary safe/unsafe verdict with no explanation.

### The Solution

ScamShield AI provides a single platform where users can submit any suspicious content — a URL they received, an email body they want to verify, an SMS, a QR code from a flyer, or a screenshot of a suspicious message — and receive a structured risk report with:

- A **0–100 risk score** with a categorical label (Safe / Low / Medium / High / Critical)
- **Specific risk flags** identified during analysis
- A **plain-English explanation** written for non-technical users
- **Scan history** so users can track what they have checked

### Why ScamShield AI

- **Multi-modal** — Five distinct scanner types under one authenticated account
- **Explainable** — AI reasoning is surfaced to the user, not hidden behind a number
- **Production-quality** — Clean architecture, typed everywhere, secure authentication, comprehensive error handling
- **Open source** — Fully transparent codebase, documented architecture, reproducible locally

---

## Features

### Authentication
Secure registration and login with JWT access tokens held in memory and HTTP-only refresh cookies. Token rotation on every refresh. Password validation with complexity requirements. Profile management and password change from settings.

### Dashboard
Activity summary showing recent scans, total scan count, risk distribution breakdown, and quick-access entry points to each scanner.

### URL Scanner
Submit any URL for deep analysis. Extracts domain, subdomain chain, path, and query parameters. Integrates Google Safe Browsing and VirusTotal signals. AI reasoning over all collected signals produces a calibrated risk score.

### Email Scanner
Paste an email body (with optional headers) for full analysis. Extracts all embedded URLs, detects urgency language patterns, identifies sender display name vs. domain mismatches, and analyses brand impersonation signals.

### SMS Scanner
Paste SMS or instant message text. Detects shortlinks and expands them through the URL pipeline. Identifies smishing keyword patterns, unexpected callback numbers, and delivery/OTP impersonation language.

### QR Scanner
Upload a QR code image. The decoded payload is routed through the URL pipeline if it resolves to a URL, or through a text pipeline with QR context if it decodes to text, vCard, or WiFi credentials.

### OCR Scanner
Upload any image containing text — screenshots of messages, photos of printed notices, social media screenshots. Tesseract.js extracts all readable text, embedded URLs are identified and scanned, and the full corpus is analysed for scam patterns.

### Risk Engine
A calibrated multi-signal scoring engine combining static heuristics (domain age, redirect chains, keyword patterns, urgency density) with AI-generated signal weights. Produces a normalised 0–100 integer score and categorical risk label.

### AI Explain
On-demand plain-English explanation for any scan result. Powered by Groq's Llama 3 model. Available inline on scan results and from scan history. Explains what was found and why it is considered risky in language accessible to all users.

### Scan History
Searchable, filterable log of all past scans. Filter by type, risk level, and date range. Re-run AI explain on any historical scan. Full result detail view with all extracted signals.

### Analytics
Visual dashboard built with Recharts. Scan volume over time, risk level distribution pie chart, scanner type breakdown, and trend analysis. Helps users understand their scanning patterns and risk exposure.

### Settings
Profile update (name, email), password change with current password verification, dark mode preference toggle, and account deletion with soft-delete confirmation modal.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 18 | UI component framework |
| TypeScript 5 | Full type safety across the entire frontend |
| Vite | Build tooling and dev server |
| Tailwind CSS 3 | Utility-first styling with custom design tokens |
| Framer Motion | Page transitions and micro-interaction animations |
| React Router v6 | Client-side routing with code-split lazy loading |
| React Hook Form + Zod | Form state management and schema validation |
| Zustand | Lightweight client state (sidebar, UI preferences) |
| TanStack Query v5 | Server state, caching, and background refetching |
| Recharts | Data visualisation for the analytics dashboard |
| Axios | HTTP client with interceptor-based token management |
| Sonner | Toast notification system |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|-----------|---------|
| Node.js 20+ | JavaScript runtime |
| Express 4 | HTTP framework and middleware pipeline |
| TypeScript 5 | Type safety across all server modules |
| Zod | Request body validation schemas |
| bcrypt | Password hashing (cost factor 12) |
| jsonwebtoken | JWT generation and verification |
| Mongoose 8 | MongoDB ODM with schema validation |
| Morgan | HTTP request logging |
| Helmet | Security header middleware |
| CORS | Origin-controlled cross-origin request handling |
| Multer | Multipart form upload handling |
| Tesseract.js | On-device OCR text extraction |
| jimp | Image pre-processing before OCR |
| qrcode-reader | QR code decoding from uploaded images |

### Database

| Technology | Purpose |
|-----------|---------|
| MongoDB | Primary data store — users, scan records, history |
| Mongoose | Schema definition, validation, soft-delete queries |

### AI

| Technology | Purpose |
|-----------|---------|
| Groq API | LLM inference — Llama 3 models for fast AI analysis |
| Tesseract.js | OCR text extraction from images |
| Google Safe Browsing | URL reputation signal |
| VirusTotal | Multi-engine URL and domain reputation |

### Deployment

| Target | Technology |
|--------|-----------|
| Frontend | Static build — Vite output; deployable to Vercel, Netlify, Cloudflare Pages |
| Backend | Node.js service; deployable to Render, Railway, Fly.io, or any VPS |
| Database | MongoDB Atlas (managed) or self-hosted |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 React Frontend (SPA)                     │
│  Feature modules · React Router · TanStack Query        │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS REST
┌────────────────────────▼────────────────────────────────┐
│              Express REST API (Node.js)                  │
│  Helmet · CORS · Rate Limit · JWT · Zod · Error Handler │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
┌──────────▼──────────┐      ┌───────────▼───────────────┐
│    Risk Engine       │      │       Groq AI Pipeline     │
│  Signal Aggregation  │      │  Prompt Build · Llama 3   │
│  Score Calibration   │      │  Response Parse · Explain  │
└──────────┬──────────┘      └───────────┬───────────────┘
           │                              │
┌──────────▼──────────────────────────────▼──────────────┐
│                      MongoDB                             │
│         Users · Scan Records · History                   │
└────────────────────────────────────────────────────────┘
```

Full architecture documentation: [`docs/02_Architecture.md`](./docs/02_Architecture.md)

---

## Folder Structure

```
ScamShield-AI/
├── client/                     # React SPA (Vite + TypeScript)
│   └── src/
│       ├── components/         # Shared UI primitives (Button, Modal, Badge…)
│       ├── features/           # Feature modules (url-scanner, email-scanner…)
│       ├── hooks/              # Shared custom hooks
│       ├── layouts/            # Page layout wrappers
│       ├── lib/                # API client, formatters
│       ├── pages/              # Top-level pages (Landing, Privacy, Terms, 404)
│       ├── services/           # API call modules
│       ├── store/              # Zustand client state
│       ├── styles/             # Design tokens and global CSS
│       └── types/              # Shared TypeScript types
│
├── server/                     # Express API (Node.js + TypeScript)
│   └── src/
│       ├── config/             # Database, environment, logger
│       ├── features/           # Feature modules (auth, scan-url, ai…)
│       ├── lib/                # Error classes, JWT utilities, password utils
│       └── middleware/         # Auth, validation, error handler
│
├── shared/                     # Types and utilities shared across packages
├── docs/                       # Architecture, API contracts, design decisions
├── assets/                     # Static media (images, icons, fonts)
├── prompts/                    # AI prompt templates
├── scripts/                    # Automation utilities
└── postman/                    # API collection for manual testing
```

---

## Installation

### Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier
- **Groq API key** — free at [console.groq.com](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/shubhh004/ScamShield-AI.git
cd ScamShield-AI
```

### 2. Install dependencies

```bash
# Root dev tools (concurrently, prettier)
npm install

# Client dependencies
npm install --prefix client

# Server dependencies
npm install --prefix server
```

### 3. Configure environment variables

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

Edit `server/.env` — at minimum set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `GROQ_API_KEY`.

### 4. Run locally

```bash
# Start both client (port 5173) and server (port 5000) concurrently
npm run dev
```

Or run them separately:

```bash
npm run dev:client   # Vite dev server — http://localhost:5173
npm run dev:server   # Express server  — http://localhost:5000
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | `development` \| `production` \| `test` (default: `development`) |
| `PORT` | No | Server port (default: `5000`) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins (default: `http://localhost:5173`) |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **Yes** | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES` | No | Access token lifetime (default: `15m`) |
| `JWT_REFRESH_EXPIRES` | No | Refresh token lifetime (default: `7d`) |
| `BCRYPT_SALT_ROUNDS` | No | bcrypt cost factor (default: `12`) |
| `GROQ_API_KEY` | **Yes** | Groq API key for AI inference |
| `GROQ_MODEL` | No | Model ID (default: `llama3-8b-8192`) |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud for image uploads |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Optional | URL reputation signal |
| `VIRUSTOTAL_API_KEY` | Optional | Multi-engine URL reputation |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Backend base URL (default: `http://localhost:5000/api/v1`) |

Full reference: [`server/.env.example`](./server/.env.example) · [`client/.env.example`](./client/.env.example)

---

## API Overview

All endpoints are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <accessToken>`.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Register a new account |
| `POST` | `/auth/login` | — | Login and receive tokens |
| `POST` | `/auth/refresh` | Cookie | Rotate access token |
| `POST` | `/auth/logout` | Bearer | Invalidate refresh token |
| `GET` | `/auth/me` | Bearer | Get current user profile |
| `PATCH` | `/auth/profile` | Bearer | Update name / email |
| `POST` | `/auth/change-password` | Bearer | Change password |
| `DELETE` | `/auth/account` | Bearer | Soft-delete account |

### Scanners

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/scan/url` | Optional | URL threat analysis |
| `POST` | `/scan/email` | Optional | Email body analysis |
| `POST` | `/scan/sms` | Optional | SMS / text analysis |
| `POST` | `/scan/qr` | Optional | QR code image decode + analysis |
| `POST` | `/scan/image` | Optional | OCR image analysis |

### History & Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/history` | Bearer | Paginated scan history |
| `GET` | `/history/:id` | Bearer | Single scan detail |
| `DELETE` | `/history/:id` | Bearer | Delete a history entry |
| `GET` | `/dashboard` | Bearer | Activity summary stats |
| `GET` | `/analytics` | Bearer | Chart data for analytics |

### AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ai/explain` | Bearer | Plain-English explanation for a scan |

Full API reference: [`docs/06_API_Core.md`](./docs/06_API_Core.md) · [`docs/06_API_Scanning.md`](./docs/06_API_Scanning.md)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server concurrently |
| `npm run dev:client` | Vite dev server only (port 5173) |
| `npm run dev:server` | Express server only (port 5000) |
| `npm run build` | Production build — client and server |
| `npm run format` | Format all files with Prettier |
| `npm --prefix client run lint` | ESLint on client |
| `npm --prefix server run lint` | ESLint on server |
| `npm --prefix client run type-check` | TypeScript check on client |
| `npm --prefix server run type-check` | TypeScript check on server |

---

## Screenshots

> Screenshots will be added here following the first production deployment.

| Screen | Description |
|--------|-------------|
| Landing Page | Marketing page with feature overview and CTA |
| Dashboard | Activity summary with recent scans and stats |
| URL Scanner | Scan form and risk report result |
| Email Scanner | Email body analysis with embedded URL extraction |
| SMS Scanner | SMS text analysis with smishing detection |
| QR Scanner | QR image upload and decoded payload analysis |
| OCR Scanner | Image upload with extracted text and risk report |
| Scan History | Searchable history log with filter controls |
| Analytics | Charts and risk distribution visualisations |
| AI Explain | Plain-English explanation modal |
| Settings | Profile, security, and account management |

---

## Roadmap

### Completed

- [x] JWT authentication with refresh token rotation
- [x] URL threat analysis with AI risk scoring
- [x] Email body analysis with embedded URL extraction
- [x] SMS / smishing analysis
- [x] QR code image decode and analysis
- [x] OCR image scanning with Tesseract.js
- [x] AI-powered plain-English explanations (Groq)
- [x] Scan history with search and filters
- [x] Analytics dashboard with Recharts
- [x] Profile management and password change
- [x] Account deletion with soft-delete
- [x] Landing page, Privacy Policy, Terms of Service
- [x] Responsive design across all breakpoints
- [x] Framer Motion animation system

### In Progress

- [ ] Email verification flow
- [ ] Password reset via email
- [ ] Scan result sharing (public permalink)

### Planned

- [ ] Chrome extension (Manifest V3)
- [ ] Mobile application (React Native)
- [ ] Developer API with API key authentication
- [ ] Multi-language support (i18n)
- [ ] Real-time scan status via WebSocket
- [ ] Enterprise tier with team management
- [ ] Bulk URL scanning endpoint
- [ ] Webhook notifications for high-risk results

---

## Documentation

| Document | Contents |
|----------|---------|
| [`docs/01_Vision.md`](./docs/01_Vision.md) | Product vision and mission |
| [`docs/02_Architecture.md`](./docs/02_Architecture.md) | Complete system architecture with Mermaid diagrams |
| [`docs/03_TechStack.md`](./docs/03_TechStack.md) | Technology decisions and rationale |
| [`docs/04_FolderStructure.md`](./docs/04_FolderStructure.md) | Repository layout and dependency rules |
| [`docs/05_Database.md`](./docs/05_Database.md) | MongoDB schema and collection design |
| [`docs/06_API_Core.md`](./docs/06_API_Core.md) | REST API reference — authentication and standards |
| [`docs/06_API_Scanning.md`](./docs/06_API_Scanning.md) | REST API reference — scanner endpoints |
| [`docs/07_UI_System.md`](./docs/07_UI_System.md) | Design system, tokens, and component conventions |
| [`docs/09_AI.md`](./docs/09_AI.md) | AI pipeline architecture and prompt design |
| [`docs/RiskEngine.md`](./docs/RiskEngine.md) | Risk scoring engine — signals, calibration, categories |
| [`docs/AIExplain.md`](./docs/AIExplain.md) | AI Explain feature — prompt design and response format |
| [`docs/13_Testing.md`](./docs/13_Testing.md) | Testing strategy and coverage targets |

---

## Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes with a descriptive message
4. Push to your fork and open a pull request against `main`

---

## Security

Found a security vulnerability? Please do **not** open a public issue. Follow the responsible disclosure process described in [`SECURITY.md`](./SECURITY.md).

---

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for full terms.

---

## Author

**Shubh Chaurasia**

- GitHub: [@shubhh004](https://github.com/shubhh004)
- LinkedIn: [linkedin.com/in/shubhchaurasia](https://linkedin.com/in/shubhchaurasia)
- Email: [chaurasiashubh195@gmail.com](mailto:chaurasiashubh195@gmail.com)

---

<div align="center">

Built with ❤️ by <strong>Shubh Chaurasia</strong>

<sub>If this project helped you, consider giving it a ⭐</sub>

</div>
