# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `1.x` (main branch) | ✅ Active |
| Older branches | ❌ Not supported |

Only the latest version on the `main` branch receives security updates.

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Public disclosure before a fix is available puts all users at risk. Please follow responsible disclosure:

### How to Report

Send a detailed report to: **[chaurasiashubh195@gmail.com](mailto:chaurasiashubh195@gmail.com)**

Use the subject line: `[ScamShield AI] Security Vulnerability Report`

### What to Include

- **Description** — Clear explanation of the vulnerability and its potential impact
- **Reproduction steps** — Minimal, exact steps to reproduce the issue
- **Affected components** — Which part of the system is affected (client, server, auth, scanner, etc.)
- **Proof of concept** — Code, screenshots, or HTTP request/response logs if available
- **Suggested fix** — Optional, but appreciated if you have one

### What to Expect

| Step | Timeline |
|------|----------|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 business days |
| Status update | Every 7 days until resolved |
| Fix and disclosure | Coordinated with reporter |

You will be credited in the fix unless you request anonymity.

---

## Security Design

ScamShield AI is built with security as a first-class concern. Key mechanisms:

| Mechanism | Implementation |
|-----------|---------------|
| **Authentication** | JWT access tokens stored in memory (not localStorage). HTTP-only refresh cookies. Token rotation on every refresh. |
| **Password storage** | bcrypt with cost factor 12. Plain-text passwords never logged or stored. |
| **Transport security** | HTTPS enforced in production. HSTS headers via Helmet. |
| **Input validation** | All request bodies validated with Zod schemas before any business logic runs. |
| **SQL/NoSQL injection** | Mongoose parameterised queries only. No raw query string construction. |
| **CORS** | Explicit origin allowlist. No wildcard origins. |
| **Security headers** | Helmet middleware: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. |
| **Rate limiting** | Per-route throttling on all endpoints. Stricter limits on authentication routes. |
| **Soft deletes** | Accounts are soft-deleted, not hard-deleted. No data gaps from missing records. |
| **Secret management** | All secrets via environment variables. No secrets in source code or logs. |

---

## Out of Scope

The following are **not** considered security vulnerabilities for this project:

- Self-XSS that requires the user to execute their own code in the browser console
- Denial of service via volumetric attacks (handled at the infrastructure layer)
- Social engineering of the maintainer
- Issues in third-party dependencies — report these to the dependency maintainer directly
- Vulnerabilities in development-only configurations (e.g. when `NODE_ENV=development`)
- Theoretical vulnerabilities with no practical attack path

---

## Dependency Security

Dependencies are audited periodically with `npm audit`. If you find a known CVE in a dependency used by this project, please open a regular GitHub issue rather than a private security report unless the vulnerability is directly exploitable through the application's exposed surface.
