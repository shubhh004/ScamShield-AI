# ScamShield AI — REST API Reference (Part 2)

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Approved |
| **Related** | [06_API.md](./06_API.md), [05_Database.md](./05_Database.md), [08_AI.md](./08_AI.md) |

> All endpoints in this document require `Authorization: Bearer <accessToken>` unless stated otherwise. See Part 1 for auth rules, error codes, and response format.

---

## 1. Scan APIs

Scan submissions are asynchronous. Every `POST /scan/*` returns `202 Accepted` immediately with a `jobId`. The client polls `GET /scan/:id` until `status` is `completed` or `failed`.

---

### POST `/scan/url`

**Purpose:** Submit a URL for AI-powered phishing and reputation analysis.

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `url` | string | Yes | Valid `http://` or `https://` URL, max 2,048 chars |

**Success `202`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.scanId` | string | ObjectId of the created `scanRecord` |
| `data.status` | string | `queued` |
| `data.estimatedMs` | number | Estimated processing time in milliseconds |

**Common errors:** `400` invalid URL format · `429` rate limit exceeded

---

### POST `/scan/email`

**Purpose:** Submit email body text for phishing and social engineering analysis.

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `body` | string | Yes | 1–10,000 chars |
| `headers` | string | No | Raw email headers, max 5,000 chars |
| `subject` | string | No | Email subject line, max 998 chars |

**Success `202`:** Same shape as `/scan/url` response.

**Common errors:** `400` body empty or exceeds limit · `429` rate limit

---

### POST `/scan/sms`

**Purpose:** Submit SMS text for smishing and impersonation analysis.

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `text` | string | Yes | 1–1,600 chars |

**Success `202`:** Same shape as `/scan/url` response.

**Common errors:** `400` text empty or exceeds limit · `429` rate limit

---

### POST `/scan/image`

**Purpose:** Upload an image for OCR extraction and scam content analysis.

**Request:** `multipart/form-data`

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `image` | file | Yes | JPEG, PNG, or WEBP; max 10 MB |

**Success `202`:** Same shape as `/scan/url` response.

**Common errors:** `400` missing file, unsupported format, or exceeds size limit · `429` rate limit

---

### POST `/scan/qr`

**Purpose:** Upload a QR code image. The server decodes the payload and routes it through the appropriate pipeline.

**Request:** `multipart/form-data`

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `image` | file | Yes | JPEG, PNG, or WEBP; max 10 MB |

**Success `202`:** Same shape as `/scan/url` response. Includes `data.decodedType: "url" | "text" | "wifi" | "vcard"` once decoded.

**Common errors:** `400` no QR code detected in image · `422` QR payload empty · `429` rate limit

---

### GET `/scan/:id`

**Purpose:** Poll for scan status and retrieve the result once processing is complete.

**Path parameter:** `id` — ObjectId of the `scanRecord`

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.scanId` | string | |
| `data.scanType` | string | `url` \| `email` \| `sms` \| `image` \| `qr` |
| `data.status` | string | `queued` \| `processing` \| `completed` \| `failed` |
| `data.report` | object \| null | Present when `status` is `completed`; see report shape below |
| `data.error` | string \| null | Failure reason when `status` is `failed` |
| `data.createdAt` | string | ISO 8601 UTC |
| `data.updatedAt` | string | ISO 8601 UTC |

**Report object (when completed):**

| Field | Type | Description |
|-------|------|-------------|
| `riskScore` | number | 0–100 |
| `riskCategory` | string | `safe` \| `low` \| `medium` \| `high` \| `critical` |
| `confidence` | number | 0.0–1.0 |
| `flags` | string[] | Risk indicators raised by the AI |
| `explanation` | string | Plain-English summary |
| `processingMs` | number | Total pipeline duration |
| `cacheHit` | boolean | Result served from cache |

**Common errors:** `404` scan not found · `403` scan belongs to different user

---

### GET `/scan/:id/report`

**Purpose:** Retrieve only the `scanReport` document for a completed scan.

**Success `200`:** The full report object as defined above, plus `aiProvider` and `modelVersion` fields.

**Common errors:** `404` report not found · `422` scan not yet completed

---

## 2. Scan History

### GET `/history`

**Purpose:** Paginated list of the authenticated user's scan records, newest first.

**Query parameters:** See Section 8. Additionally:

| Parameter | Type | Description |
|-----------|------|-------------|
| `scanType` | string | Filter by `url`, `email`, `sms`, `image`, `qr` |
| `riskCategory` | string | Filter by `safe`, `low`, `medium`, `high`, `critical` |
| `status` | string | Filter by `completed`, `failed`, `queued` |

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.scans` | array | Array of scan records with embedded report summary |
| `meta.page` | number | Current page |
| `meta.limit` | number | Items per page |
| `meta.total` | number | Total matching records |
| `meta.totalPages` | number | |

Each item in `data.scans` includes: `scanId, scanType, status, riskScore, riskCategory, createdAt`.

---

### GET `/history/:id`

**Purpose:** Full detail for a single historical scan, including the complete report.

**Success `200`:** Full `scanRecord` merged with the associated `scanReport`. Identical shape to `GET /scan/:id` with `status: completed`.

**Common errors:** `404` scan not found · `403` not owner

---

### DELETE `/history/:id`

**Purpose:** Soft-delete a scan record from the user's history.

**Success `204`:** No body.

**Common errors:** `404` scan not found · `403` not owner

---

## 3. Dashboard APIs

### GET `/dashboard/stats`

**Purpose:** Aggregated scan counts and risk summary for the authenticated user's dashboard overview.

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.totalScans` | number | All-time scan count |
| `data.scansThisMonth` | number | Scans in the current calendar month |
| `data.threatsDetected` | number | Scans with `riskCategory` of `high` or `critical` |
| `data.safeScans` | number | Scans with `riskCategory` of `safe` |
| `data.scansByType` | object | `{ url, email, sms, image, qr }` counts |
| `data.riskBreakdown` | object | `{ safe, low, medium, high, critical }` counts |

---

### GET `/dashboard/recent`

**Purpose:** Most recent scans for the dashboard activity feed.

**Query parameters:** `limit` (default 5, max 10)

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.scans` | array | Array of `{ scanId, scanType, riskScore, riskCategory, createdAt }` |

---

### GET `/dashboard/activity`

**Purpose:** Daily scan count for the last 30 days, used to render the activity sparkline.

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.activity` | array | Array of `{ date: "2026-07-10", count: 7 }` — 30 entries |

---

## 4. Notification APIs

### GET `/notifications`

**Purpose:** List notifications for the authenticated user, newest first.

**Query parameters:** `page`, `limit`, `status` (`read` \| `unread`)

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.notifications` | array | `{ id, type, message, isRead, createdAt }` |
| `data.unreadCount` | number | Total unread notifications |
| `meta` | object | Pagination metadata |

---

### PATCH `/notifications/:id/read`

**Purpose:** Mark a single notification as read.

**Success `200`:** `{ success: true, data: { id, isRead: true } }`

**Common errors:** `404` notification not found · `403` not owner

---

### PATCH `/notifications/read-all`

**Purpose:** Mark all unread notifications as read for the authenticated user.

**Success `200`:** `{ success: true, data: { updated: 12 } }` — count of records updated.

---

## 5. Feedback APIs

### POST `/feedback`

**Purpose:** Submit a false-positive or false-negative report on a completed scan.

**Request body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `scanId` | string | Yes | Valid ObjectId of a completed scan owned by the user |
| `type` | string | Yes | `falsePositive` \| `falseNegative` \| `generalFeedback` |
| `comment` | string | No | Max 1,000 chars |

**Success `201`:** `{ success: true, data: { feedbackId } }`

**Common errors:** `404` scan not found · `403` not owner · `409` feedback already submitted for this scan

---

### GET `/feedback`

**Purpose:** List the authenticated user's previously submitted feedback.

**Query parameters:** `page`, `limit`

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.feedback` | array | `{ id, scanId, type, comment, resolved, createdAt }` |
| `meta` | object | Pagination metadata |

---

## 6. Analytics APIs

These endpoints aggregate scan data for the authenticated user and are used by the analytics section of the dashboard.

---

### GET `/analytics/scans`

**Purpose:** Total scan volume grouped by type and date range.

**Query parameters:** `from`, `to` (ISO 8601 dates), `groupBy` (`day` \| `week` \| `month`, default `day`)

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.series` | array | `{ period: "2026-07-10", url: 3, email: 1, sms: 0, image: 2, qr: 1 }` |
| `data.totals` | object | Summed counts per scan type for the period |

---

### GET `/analytics/trends`

**Purpose:** Week-over-week change in scan volume and threat detection rate.

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.scanGrowth` | number | Percentage change from previous 7 days |
| `data.threatGrowth` | number | Percentage change in `high` + `critical` scans |
| `data.topScanType` | string | Most-used scan type in the last 7 days |
| `data.avgRiskScore` | number | Average risk score across all scans in the last 7 days |

---

### GET `/analytics/risk-distribution`

**Purpose:** Breakdown of scan results by risk category for a given date range.

**Query parameters:** `from`, `to`

**Success `200`:**

| Field | Type | Description |
|-------|------|-------------|
| `data.distribution` | object | `{ safe: 42, low: 18, medium: 9, high: 6, critical: 2 }` |
| `data.total` | number | Sum of all categories in the period |
| `data.highRiskPercentage` | number | `(high + critical) / total * 100` |

---

## 7. Admin APIs (Future)

Reserved for the enterprise and administration tier. To be defined in a separate document when the enterprise feature is scoped.

| Endpoint | Purpose |
|----------|---------|
| `GET /admin/users` | List all users with search and filter |
| `GET /admin/users/:id` | Full user profile with scan history |
| `PATCH /admin/users/:id/suspend` | Suspend a user account |
| `GET /admin/scans` | Platform-wide scan feed with filters |
| `GET /admin/analytics` | Platform-wide aggregate analytics |
| `GET /admin/feedback` | Unresolved feedback queue |
| `PATCH /admin/feedback/:id/resolve` | Mark feedback as reviewed |

---

## 8. Standard Query Parameters

Applied consistently across all paginated and filterable endpoints.

| Parameter | Type | Default | Rules |
|-----------|------|---------|-------|
| `page` | integer | `1` | ≥ 1 |
| `limit` | integer | `20` | 1–100 |
| `sort` | string | `createdAt` | Field name to sort by |
| `order` | string | `desc` | `asc` \| `desc` |
| `search` | string | — | Free-text search where supported; max 200 chars |
| `from` | string | — | ISO 8601 date; start of date range (inclusive) |
| `to` | string | — | ISO 8601 date; end of date range (inclusive) |

Requests with `page` or `limit` out of range return `400 VALIDATION_ERROR`. `from` after `to` returns `422 BUSINESS_RULE_VIOLATION`.

---

## 9. Decision Log

| Decision | Reason |
|----------|--------|
| `202 Accepted` for all scan submissions | AI pipeline latency (2–15 s) must not block the HTTP response cycle |
| Polling via `GET /scan/:id` over WebSocket for MVP | Simpler to implement and debug; WebSocket push is the documented upgrade path |
| Report embedded in `GET /scan/:id` when completed | Avoids a mandatory second request just to see the result |
| Separate `GET /scan/:id/report` endpoint | Allows clients to fetch only the report without the full scan record metadata |
| `403` not `404` on cross-user scan access | Returning `404` on others' scans leaks that the scan exists; `403` is the correct response |
| `scansByType` and `riskBreakdown` on `/dashboard/stats` | Dashboard needs both in one request to avoid two round-trips on initial load |
| `highRiskPercentage` pre-computed on risk-distribution endpoint | Computed field prevents each client from independently deriving it, avoiding rounding inconsistency |
| Soft delete on `DELETE /history/:id` | Preserves analytics integrity; hard delete would skew historical aggregates |

---

## 10. Conclusion

Part 2 completes the ScamShield AI REST API surface. Together with Part 1, every client interaction — scanning, history retrieval, dashboard data, notifications, feedback, and analytics — is specified with enough detail for independent backend and frontend implementation. The async scan pattern (`202 → poll → completed`) is the structural backbone of the scan APIs and must be honoured consistently across all five scanner types. Admin endpoints are listed but deferred to the enterprise tier specification.

---

| | |
|---|---|
| **Document Status** | Approved |
| **Version** | 1.0 |
| **Owner** | Engineering Team |
| **Next Document** | [07_UI_System.md](./07_UI_System.md) |
