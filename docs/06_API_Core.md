# ScamShield AI — REST API Reference (Part 1)

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Approved |
| **Related** | [05_Database.md](./05_Database.md), [02_Architecture.md](./02_Architecture.md), [06_API_Part2.md](./06_API_Part2.md) |

---

## 1. API Standards

| Standard | Value |
|----------|-------|
| **Base URL (development)** | `http://localhost:5000/api/v1` |
| **Base URL (production)** | `https://api.scamshield.ai/api/v1` |
| **Versioning** | URL path prefix `/v1/` — version bump only on breaking changes |
| **Content-Type** | `application/json` for all requests and responses |
| **Character encoding** | UTF-8 |
| **Timestamps** | ISO 8601 UTC — `2026-07-10T14:30:00.000Z` |
| **IDs** | MongoDB ObjectId strings — 24-character hex |
| **Auth header** | `Authorization: Bearer <accessToken>` |
| **Error format** | Consistent `{ success: false, error: { code, message, details? } }` |

---

## 2. HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH |
| `201` | Created | Successful POST that creates a resource |
| `202` | Accepted | Request queued for async processing |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation failure, malformed input |
| `401` | Unauthorized | Missing or invalid access token |
| `403` | Forbidden | Valid token, insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource (e.g. email already registered) |
| `422` | Unprocessable Entity | Input valid in format but rejected by business rule |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |
| `503` | Service Unavailable | AI provider or external service unreachable |

---

## 3. Authentication APIs

All auth endpoints are public (no token required) unless stated otherwise.

---

### POST `/auth/register`

**Purpose:** Create a new user account and return an access token.

**Auth required:** No

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | 2–100 chars |
| `email` | string | Yes | Valid email, unique, lowercased |
| `password` | string | Yes | 8–72 chars, min 1 uppercase, 1 number, 1 special char |

**Success `201`:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `data.accessToken` | string | JWT, 15-minute expiry |
| `data.user.id` | string | New user ObjectId |
| `data.user.name` | string | |
| `data.user.email` | string | |
| `data.user.role` | string | `user` |
| `data.user.isEmailVerified` | boolean | `false` |

**Set-Cookie:** `refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`

**Common errors:** `409` email already exists · `400` validation failure

---

### POST `/auth/login`

**Purpose:** Authenticate with email and password, return tokens.

**Auth required:** No

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | 8–72 chars |

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `data.accessToken` | string | JWT, 15-minute expiry |
| `data.user` | object | `id, name, email, role, isEmailVerified` |

**Set-Cookie:** `refreshToken` — same attributes as register

**Common errors:** `401` invalid credentials · `400` validation failure · `429` rate limit

---

### POST `/auth/logout`

**Purpose:** Invalidate the refresh token and clear the cookie.

**Auth required:** Yes (access token) + refresh token cookie

**Request body:** None

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `data.message` | string | `Logged out successfully` |

**Clears-Cookie:** `refreshToken`

**Common errors:** `401` not authenticated

---

### POST `/auth/refresh`

**Purpose:** Exchange a valid refresh token for a new access token and rotated refresh token.

**Auth required:** Refresh token cookie only (no access token needed)

**Request body:** None — refresh token read from `HttpOnly` cookie

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `data.accessToken` | string | New JWT, 15-minute expiry |

**Set-Cookie:** Rotated `refreshToken`

**Common errors:** `401` missing, expired, or already-used refresh token

---

### GET `/auth/me`

**Purpose:** Return the authenticated user's profile.

**Auth required:** Yes

**Request body:** None

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `data.user` | object | `id, name, email, role, isEmailVerified, createdAt` |

**Common errors:** `401` not authenticated

---

### POST `/auth/forgot-password`

**Purpose:** Send a password reset email to the registered address.

**Auth required:** No

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email format |

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `data.message` | string | `If that email is registered, a reset link has been sent` |

> Response is identical whether or not the email exists — prevents user enumeration.

**Common errors:** `400` invalid email format · `429` rate limit (3 requests per hour per IP)

---

### POST `/auth/reset-password`

**Purpose:** Set a new password using a valid reset token from the email link.

**Auth required:** No

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `token` | string | Yes | Reset token from email link |
| `password` | string | Yes | 8–72 chars, complexity rules apply |

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `data.message` | string | `Password reset successfully` |

**Common errors:** `400` token missing or invalid · `422` token expired · `400` password fails complexity rules

---

### POST `/auth/verify-email`

**Purpose:** Confirm email ownership using the token sent after registration.

**Auth required:** No

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `token` | string | Yes | Verification token from email link |

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` |
| `data.message` | string | `Email verified successfully` |

**Common errors:** `400` token invalid · `422` token expired · `409` email already verified

---

## 4. User APIs

All user endpoints require authentication.

---

### GET `/users/profile`

**Purpose:** Retrieve the authenticated user's full profile and settings.

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.user` | object | `id, name, email, role, isEmailVerified, createdAt` |
| `data.settings` | object | `emailNotifications, scanAlertThreshold, defaultScanType, timezone` |

---

### PATCH `/users/profile`

**Purpose:** Update display name or timezone. Email changes are not permitted here.

**Request body (all optional):**

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | 2–100 chars |
| `timezone` | string | Valid IANA timezone string |

**Success `200`:** Updated user object

**Common errors:** `400` validation failure

---

### PATCH `/users/password`

**Purpose:** Change password while authenticated. Requires current password confirmation.

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `currentPassword` | string | Yes | Must match stored hash |
| `newPassword` | string | Yes | 8–72 chars, complexity rules, must differ from current |

**Success `200`:** `{ success: true, data: { message: "Password updated successfully" } }`

**Common errors:** `401` current password incorrect · `422` new password same as current · `400` complexity failure

---

### DELETE `/users/account`

**Purpose:** Soft-delete the authenticated user account. Requires password confirmation.

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `password` | string | Yes | Current password for confirmation |

**Success `200`:** `{ success: true, data: { message: "Account deleted" } }`

**Side effects:** Sets `isDeleted: true`, `deletedAt: now` on the user document. Clears refresh token. Active scans continue to completion and are soft-deleted.

**Common errors:** `401` password incorrect

---

## 5. System APIs

### GET `/health`

**Purpose:** Liveness and readiness check for deployment platform health checks and monitoring.

**Auth required:** No

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `ok` \| `degraded` |
| `version` | string | Application version from `package.json` |
| `services.database` | string | `connected` \| `disconnected` |
| `services.redis` | string | `connected` \| `disconnected` |
| `services.queue` | string | `running` \| `stopped` |
| `services.gemini` | string | `reachable` \| `unreachable` |
| `uptime` | number | Process uptime in seconds |
| `timestamp` | string | ISO 8601 UTC |

---

### GET `/version`

**Purpose:** Return the deployed application version.

**Auth required:** No

**Success `200`:** `{ version: "1.0.0", environment: "production" }`

---

## 6. Validation Rules

| Field | Rule |
|-------|------|
| `email` | Valid RFC 5322 format, lowercased, max 254 chars |
| `password` | 8–72 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special character |
| `name` | 2–100 chars, no leading/trailing whitespace |
| `url` | Valid URL with `http://` or `https://` scheme only; max 2,048 chars |
| `pagination.page` | Integer ≥ 1, default 1 |
| `pagination.limit` | Integer 1–100, default 20 |
| `ObjectId` | 24-character hexadecimal string |
| `token` | Non-empty string, alphanumeric, max 512 chars |
| `timezone` | Must be a valid IANA timezone identifier |
| String inputs | Control characters stripped; null bytes rejected |

---

## 7. Authentication Rules

| Property | Value |
|----------|-------|
| **Access token** | JWT signed with `HS256`; stored in memory (JS variable); 15-minute TTL |
| **Refresh token** | Opaque token; stored as bcrypt hash in `users.refreshTokenHash`; 7-day TTL |
| **Cookie** | `HttpOnly; Secure; SameSite=Strict`; path scoped to `/api/v1/auth` |
| **Authorization header** | `Authorization: Bearer <accessToken>` on every protected request |
| **Silent refresh** | Client calls `POST /auth/refresh` on app load if access token is absent |
| **Rotation** | Refresh token is single-use; a new one is issued and the old one invalidated on every refresh |
| **Revocation** | Logout clears `refreshTokenHash` from the database; the old refresh token is immediately invalid |
| **Protected routes** | All endpoints except `/auth/*`, `/health`, and `/version` require a valid access token |

---

## 8. Response Format

**Standard success response:**

```
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "totalPages": 8
  }
}
```

`meta` is present only on paginated responses.

**Standard error response:**

```
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

`details` is present only on `400` / `422` validation errors.

---

## 9. Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| `400` | `VALIDATION_ERROR` | Request body or params failed Zod schema validation |
| `401` | `UNAUTHORIZED` | Access token missing, expired, or signature invalid |
| `401` | `INVALID_CREDENTIALS` | Email or password incorrect on login |
| `401` | `INVALID_REFRESH_TOKEN` | Refresh token missing, expired, or already rotated |
| `403` | `FORBIDDEN` | Authenticated but not authorised for this resource |
| `404` | `NOT_FOUND` | Requested resource does not exist |
| `409` | `CONFLICT` | Resource already exists (e.g. duplicate email) |
| `422` | `TOKEN_EXPIRED` | Reset or verification token is valid format but past TTL |
| `422` | `BUSINESS_RULE_VIOLATION` | Input valid, but rejected by a business rule |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests; `Retry-After` header indicates wait time |
| `500` | `INTERNAL_ERROR` | Unexpected server error; details logged, not exposed |
| `503` | `SERVICE_UNAVAILABLE` | External dependency (Gemini, Safe Browsing) unreachable |

---

## 10. Decision Log

| Decision | Reason |
|----------|--------|
| URL versioning (`/api/v1/`) over header versioning | Visible, cacheable, debuggable in browser and logs without custom headers |
| Consistent `{ success, data, error }` envelope | Single response shape simplifies client interceptors and error handling |
| Identical forgot-password response for registered and unregistered emails | Prevents user enumeration attacks |
| Refresh token in `HttpOnly` cookie, access token in memory | Eliminates XSS-based token theft; cookie is not accessible to JavaScript |
| 15-minute access token TTL | Short enough to limit compromise window; silent refresh makes expiry transparent to users |
| `Retry-After` header on `429` responses | Clients can back off without arbitrary waits; reduces thundering-herd effect on limit reset |
| `202 Accepted` for queued scan requests | Async processing must not block the HTTP response; client polls status endpoint |
| Soft delete on account deletion | Preserves scan history integrity and audit trails; account can be recovered by support |

---

## 11. Conclusion

Part 1 of this document defines the foundation: API standards, the complete authentication lifecycle, user profile management, and system endpoints. Every endpoint includes its exact request shape, success response fields, and relevant error codes — enough for a backend engineer to implement and a frontend engineer to integrate without ambiguity. Part 2 covers the scan APIs, history, dashboard, and notification endpoints.

---

| | |
|---|---|
| **Document Status** | Approved |
| **Version** | 1.0 |
| **Owner** | Engineering Team |
| **Next Document** | [06_API_Part2.md](./06_API_Part2.md) |
