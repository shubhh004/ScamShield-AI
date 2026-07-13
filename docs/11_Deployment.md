# ScamShield AI — Deployment Guide

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Approved |
| **Last Updated** | July 2026 |
| **Related** | [02_Architecture.md](./02_Architecture.md), [03_TechStack.md](./03_TechStack.md) |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Variables](#3-environment-variables)
4. [Database Setup](#4-database-setup)
5. [Backend Deployment](#5-backend-deployment)
6. [Frontend Deployment](#6-frontend-deployment)
7. [CORS Configuration](#7-cors-configuration)
8. [Deployment Platforms](#8-deployment-platforms)
9. [Production Checklist](#9-production-checklist)
10. [Local Development](#10-local-development)

---

## 1. Overview

ScamShield AI is a two-process deployment:

| Process | Technology | Description |
|---------|-----------|-------------|
| **Frontend** | Static files (Vite build output) | Served from a CDN or static host; no server-side rendering |
| **Backend** | Node.js process | Express REST API; requires persistent process management |

The frontend and backend are deployed independently. This allows them to scale, update, and fail independently. The frontend communicates with the backend exclusively via HTTPS REST calls; no direct database access from the frontend.

---

## 2. Prerequisites

| Requirement | Minimum Version | Notes |
|-------------|----------------|-------|
| Node.js | 20.x LTS | Required for server build and runtime |
| npm | 10.x | Used for dependency installation |
| MongoDB | 6.x or later | MongoDB Atlas free tier is sufficient for development |
| Groq API key | — | Required for AI analysis; free tier available at [console.groq.com](https://console.groq.com) |

Optional (enhance functionality but not required for core operation):

| Service | Purpose |
|---------|---------|
| Cloudinary | Image upload handling for OCR scans |
| Google Safe Browsing API | URL reputation signal |
| VirusTotal API | Multi-engine URL reputation |

---

## 3. Environment Variables

### Backend

Copy `server/.env.example` to `server/.env` and fill in the required values.

**Required:**

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_ACCESS_SECRET=<strong-random-secret-min-32-chars>
JWT_REFRESH_SECRET=<different-strong-random-secret-min-32-chars>
GROQ_API_KEY=<your-groq-api-key>
```

**Recommended for production:**

```bash
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-frontend-domain.com
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_SALT_ROUNDS=12
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend

Copy `client/.env.example` to `client/.env.production` (or set via your hosting platform's environment variable UI):

```bash
VITE_API_URL=https://your-backend-domain.com/api/v1
```

> **Note:** Vite bakes environment variables into the static build at build time. `VITE_API_URL` must be set before running `npm run build:client`.

---

## 4. Database Setup

### MongoDB Atlas (Recommended)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Whitelist your backend server's IP address (or use `0.0.0.0/0` during development).
4. Copy the connection string into `MONGODB_URI`.

The application creates all collections and indexes automatically on first run. No manual migration steps are required for the initial deployment.

### Indexes

The following indexes are created automatically by Mongoose:

| Collection | Field(s) | Type |
|------------|---------|------|
| `users` | `email` | Unique |
| `history` | `userId, createdAt` | Compound |
| `history` | `userId, scanType` | Compound |
| `history` | `createdAt` | TTL (if enabled) |

---

## 5. Backend Deployment

### Build

```bash
cd server
npm install
npm run build
# Output: server/dist/
```

### Start

```bash
NODE_ENV=production node dist/index.js
```

### Process Management

Use a process manager to keep the server running and restart it on crash or reboot:

**PM2 (recommended):**

```bash
npm install -g pm2
pm2 start dist/index.js --name scamshield-api --env production
pm2 save
pm2 startup
```

**systemd (Linux):**

Create `/etc/systemd/system/scamshield.service`:

```ini
[Unit]
Description=ScamShield AI API
After=network.target

[Service]
Type=simple
User=<your-user>
WorkingDirectory=/path/to/server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable scamshield
systemctl start scamshield
```

---

## 6. Frontend Deployment

### Build

```bash
cd client
npm install
npm run build
# Output: client/dist/
```

### Deploy

Upload the contents of `client/dist/` to your static host.

For single-page application routing to work, configure your host to serve `index.html` for all routes (not 404). This is necessary because React Router handles routing client-side.

**Nginx configuration example:**

```nginx
server {
    listen 80;
    root /var/www/scamshield/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 7. CORS Configuration

The backend must explicitly allow requests from the frontend's origin. Set `ALLOWED_ORIGINS` in the backend environment:

```bash
# Single origin
ALLOWED_ORIGINS=https://scamshield.yourdomain.com

# Multiple origins (comma-separated)
ALLOWED_ORIGINS=https://scamshield.yourdomain.com,https://www.scamshield.yourdomain.com
```

If the origin is missing from this list, the browser will block the request with a CORS error.

---

## 8. Deployment Platforms

### Recommended Combinations

| Frontend | Backend | Database |
|---------|---------|---------|
| Vercel | Render | MongoDB Atlas |
| Netlify | Railway | MongoDB Atlas |
| Cloudflare Pages | Fly.io | MongoDB Atlas |

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel.
2. Set the **root directory** to `client`.
3. Set the **build command** to `npm run build`.
4. Set the **output directory** to `dist`.
5. Add `VITE_API_URL` to the environment variables.
6. Deploy.

### Render (Backend)

1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Set **root directory** to `server`.
4. Set **build command** to `npm install && npm run build`.
5. Set **start command** to `node dist/index.js`.
6. Add all environment variables from `server/.env.example`.
7. Deploy.

### Railway (Backend)

1. Create a new project on Railway.
2. Deploy from GitHub — select the repository.
3. Set the **root directory** to `server`.
4. Add environment variables in the Railway dashboard.
5. Railway detects `package.json` and runs `npm start` automatically.

### Fly.io (Backend)

```bash
cd server
fly launch
fly secrets set MONGODB_URI=... JWT_ACCESS_SECRET=... GROQ_API_KEY=...
fly deploy
```

---

## 9. Production Checklist

Complete these steps before accepting production traffic:

**Security:**
- [ ] `NODE_ENV=production`
- [ ] `JWT_ACCESS_SECRET` is a strong random string (min 32 chars), not the default
- [ ] `JWT_REFRESH_SECRET` is different from `JWT_ACCESS_SECRET`
- [ ] `ALLOWED_ORIGINS` contains only the production frontend domain
- [ ] HTTPS is enforced on both frontend and backend domains
- [ ] MongoDB connection string uses a dedicated database user (not admin)
- [ ] MongoDB IP allowlist contains only the backend server IP

**Functionality:**
- [ ] Health check responds: `GET /api/v1/health` returns `{ "status": "ok" }`
- [ ] Registration and login flow works end-to-end
- [ ] At least one scan type works with a valid result
- [ ] AI Explain generates a response
- [ ] History page loads and shows scans

**Environment:**
- [ ] No `.env` files committed to version control
- [ ] All required environment variables are set
- [ ] `VITE_API_URL` points to the production backend URL (with `/api/v1`)

---

## 10. Local Development

```bash
git clone https://github.com/shubhh004/ScamShield-AI.git
cd ScamShield-AI

npm install
npm install --prefix client
npm install --prefix server

cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env: set MONGODB_URI and GROQ_API_KEY at minimum

npm run dev
# Client: http://localhost:5173
# Server: http://localhost:5000
```

**Per-package commands:**

```bash
# Lint
npm --prefix client run lint
npm --prefix server run lint

# Type check
npm --prefix client run type-check
npm --prefix server run type-check

# Production build (both packages)
npm run build
```
