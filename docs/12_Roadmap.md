# ScamShield AI — Roadmap

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Living document |
| **Last Updated** | July 2026 |
| **Related** | [01_Vision.md](./01_Vision.md), [02_Architecture.md](./02_Architecture.md) |

---

## Overview

This roadmap describes what has been built, what is actively in development, and what is planned for future phases. It is a living document — priorities shift as the platform evolves.

---

## Phase 1 — Core Platform (Completed)

The initial platform establishes the full multi-modal scanning infrastructure and the foundational user experience.

### Authentication

- [x] User registration with email, name, and password
- [x] Login with JWT access token (in-memory) + HTTP-only refresh cookie
- [x] Token rotation on every refresh
- [x] Silent refresh on application load
- [x] Logout with server-side token invalidation
- [x] Profile update (name, email)
- [x] Password change with current password verification
- [x] Account deletion with soft-delete

### Scanners

- [x] URL threat analysis — heuristics + Google Safe Browsing + VirusTotal + AI
- [x] Email body analysis — URL extraction, urgency detection, sender mismatch
- [x] SMS / smishing analysis — shortlink expansion, keyword patterns
- [x] QR code decode and analysis — image upload, payload routing
- [x] OCR image scanning — Tesseract.js text extraction, URL detection

### AI & Risk Engine

- [x] Groq LLM integration (Llama 3)
- [x] Multi-signal risk scoring engine (0–100)
- [x] Risk categories: Safe / Low / Medium / High / Critical
- [x] Risk flag generation with labels and descriptions
- [x] AI Explain — on-demand plain-English explanations
- [x] Explanation caching per history record

### History & Analytics

- [x] Automatic scan history capture
- [x] History page with search, filter by type and risk level
- [x] Individual scan detail view
- [x] Analytics dashboard — scan volume, risk distribution, scanner breakdown
- [x] AI Explain available from history

### UI & UX

- [x] Premium dark-mode design system with custom tokens
- [x] Framer Motion animation system
- [x] Responsive layout across all breakpoints (320px–1920px)
- [x] Mobile sidebar with overlay and backdrop
- [x] Sonner toast notification system
- [x] Focus-trapped accessible modals
- [x] Settings page — profile, security, preferences, account

### Frontend Pages

- [x] Landing page with feature showcase and CTA
- [x] Privacy Policy page
- [x] Terms of Service page
- [x] 404 Not Found page

---

## Phase 2 — Authentication Completeness (In Progress)

Completing the authentication flows that were deferred from Phase 1.

- [ ] Email verification on registration (token sent via email)
- [ ] Resend verification email
- [ ] Password reset — request by email, reset via token link
- [ ] Login from unrecognised device notification (email alert)

---

## Phase 3 — Social Features and Sharing

- [ ] Public scan result permalink (shareable link, no auth required to view)
- [ ] Scan result embed (iframe-safe embeddable card)
- [ ] Report false positive / false negative feedback loop

---

## Phase 4 — Chrome Extension

A Manifest V3 browser extension using the same API and shared React component primitives.

- [ ] Popup UI with active tab URL pre-populated
- [ ] URL scan triggered from extension popup
- [ ] Risk score badge on browser toolbar icon
- [ ] Extension login / session management
- [ ] Passive background URL analysis on navigation

Architecture: [02_Architecture.md — Section 10](./02_Architecture.md#10-chrome-extension-architecture)

---

## Phase 5 — Developer API

A versioned REST API for third-party integration, authenticated with API keys.

- [ ] API key generation and management in Settings
- [ ] Rate limiting per API key
- [ ] Developer documentation site
- [ ] Bulk URL scanning endpoint
- [ ] Webhook delivery for high-risk scan events
- [ ] SDK stubs (Node.js, Python)

---

## Phase 6 — Mobile Application

React Native application sharing the same backend API and component primitives.

- [ ] iOS and Android application
- [ ] Camera-based QR code scanning
- [ ] Push notifications for high-risk scan results
- [ ] Native share sheet integration (share → scan)

---

## Phase 7 — Enterprise Tier

Multi-tenancy and team features for organisational deployment.

- [ ] Organisation accounts with user management
- [ ] Role-based access control (Admin, Analyst, Viewer)
- [ ] Team scan history (shared across organisation)
- [ ] SSO via SAML / OIDC
- [ ] Usage analytics and billing
- [ ] Dedicated rate limits

Architecture: [02_Architecture.md — Section 12.3](./02_Architecture.md#123-enterprise-version)

---

## Phase 8 — Infrastructure and Observability

Production-readiness improvements.

- [ ] Redis-backed AI result cache (replacing in-memory cache)
- [ ] BullMQ background job queue for long-running scans
- [ ] Sentry error tracking integration
- [ ] OpenTelemetry distributed tracing
- [ ] Structured log shipping to observability platform
- [ ] Health check endpoint enhancements
- [ ] Automated dependency auditing in CI

---

## Deprioritised / Under Evaluation

The following ideas have been discussed but are not currently planned:

| Idea | Status | Reason |
|------|--------|--------|
| SMS sending for alerts | Deprioritised | Email alerts cover the same need at lower cost |
| Browser bookmark scanner | Deprioritised | Chrome extension covers this use case |
| Local-only mode (no cloud) | Under evaluation | Requires bundling a local LLM; significant packaging complexity |
| Threat intelligence feed | Under evaluation | High maintenance cost; requires dedicated data pipeline |
