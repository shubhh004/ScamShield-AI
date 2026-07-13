# ScamShield AI — AI Explain Feature

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Approved |
| **Last Updated** | July 2026 |
| **Related** | [09_AI.md](./09_AI.md), [RiskEngine.md](./RiskEngine.md), [06_API_Scanning.md](./06_API_Scanning.md) |

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [User Experience](#2-user-experience)
3. [API Endpoint](#3-api-endpoint)
4. [Prompt Design](#4-prompt-design)
5. [Response Format](#5-response-format)
6. [Model Configuration](#6-model-configuration)
7. [Context Passed to the Model](#7-context-passed-to-the-model)
8. [Error Handling](#8-error-handling)
9. [Caching](#9-caching)
10. [Design Decisions](#10-design-decisions)

---

## 1. Purpose

The AI Explain feature bridges the gap between a risk score and user understanding. A score of `73 / High Risk` alone does not help a user decide what to do. AI Explain produces a concise, plain-English paragraph that explains:

- **What was found** — the specific patterns or signals that were detected
- **Why it is suspicious** — what these signals mean in the context of scam tactics
- **What to do** — a clear, actionable recommendation appropriate to the risk level

The feature is intentionally constrained to produce human-readable output, not technical reports. A non-technical user reading the explanation should be able to understand why a message is suspicious without any prior cybersecurity knowledge.

---

## 2. User Experience

AI Explain is available in two contexts:

1. **Inline on scan results** — An "Explain with AI" button appears on every completed scan result card. Clicking it shows a loading state and then renders the explanation in an expandable panel below the risk flags.

2. **From scan history** — Every historical scan entry in the History page has an "AI Explain" action. This triggers an on-demand explanation for any past scan regardless of when it was performed.

The explanation is generated on demand — it is not pre-computed during the scan to avoid adding latency to the scan response. The first time a user requests an explanation for a given scan, the result may take 1–4 seconds. The explanation is cached per scan record so subsequent requests for the same scan are instant.

---

## 3. API Endpoint

### `POST /api/v1/ai/explain`

**Auth required:** Bearer token

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `historyId` | string | **Yes** | MongoDB ObjectId of the history record to explain |

**Success `200`:**

```json
{
  "success": true,
  "data": {
    "explanation": "string",
    "generatedAt": "ISO 8601 timestamp"
  }
}
```

**Error responses:**

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | `historyId` missing or not a valid ObjectId |
| `403` | `FORBIDDEN` | Scan record belongs to a different user |
| `404` | `NOT_FOUND` | No history record found for the given ID |
| `503` | `AI_UNAVAILABLE` | Groq API is unreachable |

---

## 4. Prompt Design

The AI Explain prompt is a two-part structure: a **system prompt** that defines the role and constraints, and a **user prompt** that provides the scan context.

### System Prompt

```
You are a cybersecurity assistant helping everyday users understand why a piece of
digital content has been flagged as potentially dangerous.

Your explanation must:
- Be written in plain English, accessible to a non-technical user
- Be 3–5 sentences maximum
- Explain what was detected and what it means in practical terms
- Avoid jargon (no "phishing vectors", "exfiltration", "C2 infrastructure")
- Include a clear, specific recommendation appropriate to the risk level
- Never mention confidence scores, risk engine internals, or model capabilities
- Never say "I" or "my analysis"
- Start with a direct statement about what was found
```

### User Prompt

The user prompt is assembled dynamically from the scan record:

```
Scan type: {scanType}
Risk level: {riskLevel} ({riskScore}/100)
Content analysed: {input}

Detected risk flags:
{flags.map(f => `- ${f.label}: ${f.description}`).join('\n')}

Write a plain-English explanation of these findings for a non-technical user.
```

---

## 5. Response Format

The model is instructed to return a single plain-text paragraph. No JSON structure is requested from the model for this endpoint — the response is raw explanation text, stored as a string.

### Example Output (URL Scan, High Risk)

> This URL leads to a website that was registered only 4 days ago and has already been flagged by multiple security databases as a phishing site. The domain name is designed to look like a well-known bank's website, with a single letter changed to trick users who are not reading carefully. If you received this link in an email or message, do not click it and do not enter any personal information. Delete the message immediately and report it to your email provider.

### Example Output (SMS Scan, Medium Risk)

> This SMS message contains several patterns commonly used in smishing attacks — scam text messages sent to steal personal information. It claims to be from a parcel delivery company and asks you to click a shortened link to reschedule a delivery. The link resolves to a recently registered website unrelated to any known delivery service. If you are not expecting a delivery, do not click the link. If you are, contact the delivery company directly through their official website rather than through this message.

---

## 6. Model Configuration

| Parameter | Value |
|-----------|-------|
| Provider | Groq |
| Default model | `llama3-8b-8192` |
| Max output tokens | 300 |
| Temperature | 0.3 |
| Request timeout | 30 seconds |

Temperature `0.3` is chosen to produce consistent, factual output while allowing enough variation that two identical inputs do not produce word-for-word identical explanations. Higher temperatures produce more varied but occasionally inaccurate explanations.

The model is configurable via the `GROQ_MODEL` environment variable. Upgrading to `llama3-70b-8192` or `mixtral-8x7b-32768` produces higher-quality explanations at higher cost and slightly higher latency.

---

## 7. Context Passed to the Model

The explanation prompt includes:

| Context Item | Source | Reason |
|-------------|--------|--------|
| `scanType` | History record | Sets the appropriate framing (URL / email / SMS / QR / image) |
| `riskScore` | History record | Calibrates the urgency of the recommendation |
| `riskLevel` | History record | Direct label used in the recommendation |
| `input` | History record | The actual content that was scanned (truncated to 500 chars) |
| `flags` | History record | The specific signals that drove the score |

The raw scan result JSON is not included. Only the human-meaningful subset of the result is passed to avoid token waste and to keep the explanation grounded in what the user can understand.

---

## 8. Error Handling

| Failure | Behaviour |
|---------|-----------|
| Groq API returns non-JSON or malformed response | Return `503 AI_UNAVAILABLE` with descriptive message |
| Groq API times out (> 30s) | Return `503 AI_UNAVAILABLE` — do not retry on the request cycle |
| History record not found | Return `404 NOT_FOUND` |
| History record belongs to a different user | Return `403 FORBIDDEN` |
| Explanation generation succeeds but is empty | Retry once with a more explicit output format instruction |

Errors from the AI Explain endpoint are surfaced to the user as a toast notification ("Unable to generate explanation — please try again") with a retry button. AI explain failures never block access to the scan result itself.

---

## 9. Caching

AI Explain responses are cached per history record. Once an explanation has been generated for a given `historyId`, subsequent requests return the cached explanation without calling the Groq API.

Cache storage: the `explanation` field is persisted on the `History` document in MongoDB after the first successful generation. This means explanations survive application restarts and are available to the user with no latency after the first request.

There is no TTL on cached explanations. If the flags or risk score on a scan record change (which cannot happen — scans are immutable after save), the cache would be invalidated. Since scans are immutable, the cache is permanent per record.

---

## 10. Design Decisions

**Why on-demand, not pre-computed?**

Pre-computing explanations during scan execution would add 1–4 seconds of Groq API latency to every scan response, even for users who never view the explanation. The majority of scans are Safe (score < 20) and users do not need an explanation for safe content. On-demand generation means the latency is only incurred when it is wanted.

**Why a single paragraph, not a structured list?**

Early testing showed that users found bullet-point AI explanations easier to skip over than prose paragraphs. A paragraph forces a reading order and makes the recommendation harder to miss. The system prompt enforces paragraph format.

**Why constrain token output to 300?**

Longer explanations were found to dilute the actionable recommendation with excessive technical detail. Non-technical users do not need a comprehensive cybersecurity report — they need to know what happened and what to do. Three to five sentences is the right scope.

**Why not stream the response?**

Streaming adds frontend complexity (buffered rendering, partial state management) for a response that takes 1–3 seconds to complete in full. At this latency, a spinner followed by the complete text is a better UX than a typewriter effect.
