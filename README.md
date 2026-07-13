<p align="center">
  <img src="./screenshots/hero-banner.png" width="100%" alt="ScamShield AI Hero"/>
</p>

# ScamShield AI

**AI-Powered Multi-Modal Scam Detection Platform**

Analyse URLs, emails, SMS, QR codes, and images for phishing and social engineering threats — with plain-English AI explanations.

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

<div align="center">
  <img src="screenshots/hero.png" alt="ScamShield AI — Landing Page" width="900" />
</div>

---

## Features

| | Feature | Description |
|---|---------|-------------|
| 🌐 | **URL Scanner** | Domain analysis, redirect chain, Safe Browsing + VirusTotal signals, AI scoring |
| 📧 | **Email Scanner** | Embedded URL extraction, urgency detection, sender domain mismatch |
| 💬 | **SMS Scanner** | Shortlink expansion, smishing keyword patterns, OTP impersonation detection |
| 📷 | **QR Scanner** | Image decode, payload routed through URL or text pipeline |
| 🖼️ | **OCR Scanner** | Tesseract.js image text extraction, embedded URL analysis |
| 🤖 | **AI Explain** | On-demand Groq / Llama 3 plain-English explanation for any scan |
| 📊 | **Analytics** | Scan volume, risk distribution, scanner breakdown (Recharts) |
| 📜 | **History** | Searchable, filterable log with per-scan AI Explain on demand |
| 🔐 | **Auth** | JWT in memory, HTTP-only refresh cookie, bcrypt, token rotation |
| ⚙️ | **Settings** | Profile update, password change, account deletion with confirmation |

---

## Application Preview

### Dashboard

Activity summary with recent scans, risk distribution breakdown, and quick-access scanner entry points.

<div align="center">
  <img src="screenshots/dashboard.png" alt="Dashboard" width="900" />
</div>

<br />

### URL Scanner

Submit any URL for deep analysis — domain signals, Safe Browsing, VirusTotal, and AI risk scoring.

<div align="center">
  <img src="screenshots/url-scanner.png" alt="URL Scanner" width="900" />
</div>

<br />

### Email Scanner

Paste an email body to extract embedded URLs, detect urgency patterns, and identify sender mismatches.

<div align="center">
  <img src="screenshots/email-scanner.png" alt="Email Scanner" width="900" />
</div>

<br />

### SMS Scanner

Detect smishing attempts — shortlink expansion, OTP impersonation patterns, and keyword analysis.

<div align="center">
  <img src="screenshots/sms-scanner.png" alt="SMS Scanner" width="900" />
</div>

<br />

### QR Scanner

Upload a QR code image to decode and route its payload through the full threat analysis pipeline.

<div align="center">
  <img src="screenshots/qr-scanner.png" alt="QR Scanner" width="900" />
</div>

<br />

### OCR Scanner

Upload any image to extract text with Tesseract.js and scan all embedded URLs for threats.

<div align="center">
  <img src="screenshots/ocr-scanner.png" alt="OCR Scanner" width="900" />
</div>

<br />

### Analytics

Visualise scan volume, risk distribution, and scanner usage trends across your scan history.

<div align="center">
  <img src="screenshots/analytics.png" alt="Analytics" width="900" />
</div>

<br />

### History

Browse, search, and filter all past scans — re-run AI Explain on any historical result.

<div align="center">
  <img src="screenshots/history.png" alt="Scan History" width="900" />
</div>

<br />

### Settings

Manage your profile, change your password, and control account preferences in one place.

<div align="center">
  <img src="screenshots/settings.png" alt="Settings" width="900" />
</div>

---

## Tech Stack

**Frontend**

| | |
|---|---|
| React 18, TypeScript, Vite | Core framework and build tooling |
| Tailwind CSS 3, Framer Motion | Styling with custom design tokens and animations |
| React Router v6, TanStack Query v5 | Routing and server-state management |
| React Hook Form + Zod, Zustand | Form validation and client-state |
| Recharts, Axios, Sonner, Lucide React | Charts, HTTP client, toasts, icons |

**Backend**

| | |
|---|---|
| Node.js 20, Express 4, TypeScript | Runtime and HTTP framework |
| Mongoose 8, MongoDB | ODM and primary database |
| JWT, bcrypt, Zod, Helmet, CORS | Auth, validation, and security middleware |
| Tesseract.js, jimp, qrcode-reader | OCR, image pre-processing, QR decode |
| Groq API (Llama 3) | AI inference for risk explanation |

---

## Folder Structure

```
ScamShield-AI/
├── client/          # React SPA (Vite + TypeScript)
│   └── src/
│       ├── components/   # Shared UI primitives
│       ├── features/     # One module per scanner / feature
│       ├── services/     # Typed API call modules
│       └── store/        # Zustand client state
├── server/          # Express API (Node.js + TypeScript)
│   └── src/
│       ├── features/     # Route · controller · service per feature
│       ├── middleware/   # Auth, validation, error handler
│       └── lib/          # JWT, password, custom error classes
├── shared/          # Types and utilities shared across packages
└── docs/            # Architecture, API contracts, design decisions
```

---

## Installation

**Prerequisites:** Node.js 20+, MongoDB ([Atlas free tier](https://www.mongodb.com/atlas)), [Groq API key](https://console.groq.com)

```bash
git clone https://github.com/shubhh004/ScamShield-AI.git
cd ScamShield-AI
npm install && npm install --prefix client && npm install --prefix server
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` — set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `GROQ_API_KEY` at minimum.

```bash
npm run dev        # client → localhost:5173   server → localhost:5000
```

---

## Environment Variables

### `server/.env`

| Variable | Required | Default |
|----------|----------|---------|
| `MONGODB_URI` | **Yes** | — |
| `JWT_ACCESS_SECRET` | **Yes** | — |
| `JWT_REFRESH_SECRET` | **Yes** | — |
| `GROQ_API_KEY` | **Yes** | — |
| `PORT` | No | `5000` |
| `GROQ_MODEL` | No | `llama3-8b-8192` |
| `CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET` | Optional | — |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Optional | — |
| `VIRUSTOTAL_API_KEY` | Optional | — |

### `client/.env`

| Variable | Required | Default |
|----------|----------|---------|
| `VITE_API_URL` | **Yes** | `http://localhost:5000/api/v1` |

Full reference: [`server/.env.example`](./server/.env.example) · [`client/.env.example`](./client/.env.example)

---

## API Overview

Base URL: `/api/v1` · Auth: `Authorization: Bearer <token>` · All responses: `{ success, data }` or `{ success, error }`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Create account |
| `POST` | `/auth/login` | — | Login, receive tokens |
| `POST` | `/auth/refresh` | Cookie | Rotate access token |
| `POST` | `/auth/logout` | Bearer | Invalidate session |
| `GET` | `/auth/me` | Bearer | Current user profile |
| `PATCH` | `/auth/profile` | Bearer | Update name / email |
| `POST` | `/auth/change-password` | Bearer | Change password |
| `DELETE` | `/auth/account` | Bearer | Soft-delete account |
| `POST` | `/scan/url` | Optional | URL threat analysis |
| `POST` | `/scan/email` | Optional | Email body analysis |
| `POST` | `/scan/sms` | Optional | SMS / text analysis |
| `POST` | `/scan/qr` | Optional | QR code decode + analysis |
| `POST` | `/scan/image` | Optional | OCR image analysis |
| `GET` | `/history` | Bearer | Paginated scan history |
| `GET` | `/dashboard` | Bearer | Activity summary |
| `GET` | `/analytics` | Bearer | Chart data |
| `POST` | `/ai/explain` | Bearer | AI plain-English explanation |

Full reference: [`docs/06_API_Core.md`](./docs/06_API_Core.md) · [`docs/06_API_Scanning.md`](./docs/06_API_Scanning.md)

---

## Roadmap

**Completed** — JWT auth · URL / Email / SMS / QR / OCR scanners · AI Explain · History · Analytics · Settings · Landing page · Privacy & Terms · Responsive UI

**In Progress** — Email verification · Password reset · Scan result sharing

**Planned** — Chrome extension (MV3) · React Native mobile app · Developer API · WebSocket real-time updates · Enterprise multi-tenancy

---

## License

MIT © [Shubh Chaurasia](https://github.com/shubhh004) · [chaurasiashubh195@gmail.com](mailto:chaurasiashubh195@gmail.com)
