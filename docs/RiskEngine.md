# ScamShield AI — Risk Engine

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Approved |
| **Last Updated** | July 2026 |
| **Related** | [02_Architecture.md](./02_Architecture.md), [09_AI.md](./09_AI.md), [06_API_Scanning.md](./06_API_Scanning.md) |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Score Scale](#2-score-scale)
3. [Risk Categories](#3-risk-categories)
4. [Signal Types](#4-signal-types)
5. [Per-Scanner Signals](#5-per-scanner-signals)
6. [Scoring Pipeline](#6-scoring-pipeline)
7. [Calibration Philosophy](#7-calibration-philosophy)
8. [Confidence Score](#8-confidence-score)
9. [Risk Flags](#9-risk-flags)
10. [Edge Cases and Limitations](#10-edge-cases-and-limitations)

---

## 1. Overview

The Risk Engine is the component responsible for transforming raw scan signals — heuristic outputs, external API results, and AI-generated assessments — into a single, human-readable risk report. Its output is the central artefact of every scan: a `riskScore` (0–100 integer), a `riskLevel` categorical label, a `confidence` percentage, and a list of `flags` that enumerate the specific indicators that contributed to the score.

The engine is not a machine-learning model. It is a deterministic, signal-weighted scoring function. The AI layer (Groq / Llama 3) provides a structured assessment of the content as one input to the engine alongside static heuristics and external reputation signals. This design means:

- Scores are reproducible for the same input
- The contribution of each signal is auditable
- The engine degrades gracefully when AI or external signals are unavailable

---

## 2. Score Scale

Scores are always integers in the range **0–100**.

| Range | Interpretation |
|-------|---------------|
| 0–19 | Safe — no significant threat indicators detected |
| 20–39 | Low Risk — minor indicators; likely safe but worth noting |
| 40–59 | Medium Risk — multiple suspicious indicators; proceed with caution |
| 60–79 | High Risk — strong threat signals; likely malicious |
| 80–100 | Critical — confirmed or near-certain scam / phishing / malware |

A score of `0` means no signals fired. A score of `100` means the content matched every available threat indicator at maximum confidence. Practical real-world scans rarely reach `0` or `100`; most legitimate content scores between 0–15 and most confirmed scams score between 65–95.

---

## 3. Risk Categories

Each score maps to a categorical label used throughout the UI:

| Label | Score Range | Badge Colour | Use |
|-------|------------|-------------|-----|
| `SAFE` | 0–19 | Green | No action required |
| `LOW` | 20–39 | Yellow | User awareness |
| `MEDIUM` | 40–59 | Orange | Caution advised |
| `HIGH` | 60–79 | Red | Strong caution |
| `CRITICAL` | 80–100 | Deep red | Do not proceed |

---

## 4. Signal Types

The engine operates on three classes of signals:

### 4.1 Static Heuristics

Deterministic pattern-matching applied to the scan content without any external calls. These fire instantly and form the baseline of every scan.

| Signal | Description |
|--------|-------------|
| **Keyword density** | Frequency of urgency, financial, and threat keywords |
| **URL structure anomalies** | IP-as-host, excessive subdomains, lookalike TLDs |
| **Redirect depth** | Number of hops before reaching the final destination |
| **Domain age** | Calculated from WHOIS / RDAP registration date |
| **Sender mismatch** | Display name vs. actual sending domain divergence |
| **Shortlink ratio** | Proportion of embedded links that are shortlinks |
| **Character substitution** | Common homoglyph substitutions in domain names |
| **Unsolicited action demand** | Requests to click, verify, or enter credentials |

### 4.2 External Reputation Signals

Signals from third-party intelligence sources. Each is queried under a timeout; a timeout contributes `null` rather than failing the scan.

| Source | Signal |
|--------|--------|
| **Google Safe Browsing** | Known phishing, malware, or unwanted software URL |
| **VirusTotal** | Vendor detection count (0–100+ engines) |
| **WHOIS / RDAP** | Domain registration age in days |

### 4.3 AI Assessment Signals

Structured output from the Groq AI pipeline. The model receives the full scan content plus all heuristic and external signals, and returns:

| Field | Description |
|-------|-------------|
| `threatLikelihood` | Model's confidence (0–1) that the content is a scam |
| `detectedPatterns` | Array of named threat patterns identified |
| `reasoningSummary` | Brief explanation of the assessment |

The AI signal carries the highest weight in the final score calculation. If the AI pipeline is unavailable, the score is derived from heuristic and external signals only and a `degraded` flag is attached to the result.

---

## 5. Per-Scanner Signals

Each scanner type activates a specific subset of signals.

### URL Scanner

| Signal | Source | Weight |
|--------|--------|--------|
| Google Safe Browsing hit | External | High |
| VirusTotal detection count | External | High |
| Domain age < 30 days | WHOIS | High |
| IP address as host | Heuristic | Medium |
| Redirect chain depth > 3 | Heuristic | Medium |
| Lookalike domain (edit distance < 3 from known brand) | Heuristic | High |
| HTTPS absent on sensitive-looking domain | Heuristic | Medium |
| URL query string contains credential-like params | Heuristic | Low |
| AI threat likelihood | AI | Very High |

### Email Scanner

| Signal | Source | Weight |
|--------|--------|--------|
| Embedded URL risk score (max across all URLs) | URL pipeline | High |
| Urgency keyword density | Heuristic | Medium |
| Sender display name vs. domain mismatch | Heuristic | High |
| Brand name in body but domain mismatch | Heuristic | High |
| Financial action request | Heuristic | Medium |
| Credential solicitation | Heuristic | High |
| AI threat likelihood | AI | Very High |

### SMS Scanner

| Signal | Source | Weight |
|--------|--------|--------|
| Expanded shortlink risk score | URL pipeline | High |
| Smishing keyword match | Heuristic | Medium |
| Delivery / OTP impersonation pattern | Heuristic | High |
| Unknown callback number pattern | Heuristic | Low |
| Unsolicited prize / financial claim | Heuristic | High |
| AI threat likelihood | AI | Very High |

### QR Scanner

Signals depend on the payload type:

- **URL payload** → full URL scanner signal set
- **Text payload** → heuristic text signals + AI assessment
- **Payload type mismatch** (e.g. vCard resolving to URL) → additional flag

### OCR Scanner

| Signal | Source | Weight |
|--------|--------|--------|
| Extracted URL risk score (max) | URL pipeline | High |
| OCR text keyword signals | Heuristic | Medium |
| Detected brand logo with domain mismatch | Image analysis | High |
| AI threat likelihood over full OCR corpus | AI | Very High |

---

## 6. Scoring Pipeline

```
1. Collect all available signals (heuristic + external + AI)
2. Normalise each signal to a 0–1 weight
3. Apply per-signal weight coefficients
4. Sum weighted signals
5. Apply non-linear calibration curve to compress extremes
6. Round to nearest integer (0–100)
7. Assign risk category label
8. Emit: { riskScore, riskLevel, confidence, flags }
```

Signal weights are additive. A scan with many medium signals can reach the same score as a scan with one high signal. The calibration curve prevents borderline inputs from producing extreme scores without strong corroboration from multiple signal types.

When the AI signal is unavailable, the total weight budget is redistributed proportionally across the available signals, and a `degradedAnalysis: true` flag is included in the response.

---

## 7. Calibration Philosophy

The engine is calibrated to prefer **false positives over false negatives** at the borderline between Medium and High. Missing a real scam is a worse outcome than flagging something legitimate as suspicious. Users can dismiss a false positive; they cannot undo the harm from a missed scam.

The calibration is not designed to be "too aggressive" at the Safe/Low boundary. Legitimate content with structural similarities to scam patterns (e.g. a legitimate shortlink in a newsletter) should score Low, not Medium, unless additional signals corroborate a threat.

---

## 8. Confidence Score

The `confidence` value (0–100 integer) reflects how many signals fired and how consistent they are. A score of:

- **80–100** — Multiple independent signals agree; high certainty in either direction
- **50–79** — Moderate signal coverage; some ambiguity
- **20–49** — Limited signals; the risk score should be treated as a rough estimate
- **0–19** — Very few signals available (often when external APIs were unavailable); treat result with caution

Confidence is displayed in the UI alongside the risk score to help users understand how much weight to place on the result.

---

## 9. Risk Flags

Flags are named indicators included in every scan result. They are the human-readable representation of which signals fired.

Each flag has:

| Field | Description |
|-------|-------------|
| `id` | Stable identifier (e.g. `DOMAIN_VERY_YOUNG`) |
| `label` | Short label shown in the UI (e.g. `Recently registered domain`) |
| `severity` | `low` \| `medium` \| `high` \| `critical` |
| `description` | One sentence explaining what was detected and why it matters |

Flags are ordered by severity descending in the API response. The AI Explain feature uses the flag list as input when generating the plain-English explanation.

---

## 10. Edge Cases and Limitations

| Scenario | Behaviour |
|----------|-----------|
| All external APIs time out | Score derived from heuristics + AI only; `degradedAnalysis: true` |
| AI pipeline unavailable | Score derived from heuristics + external signals; lower confidence |
| Very short input (< 10 chars) | Heuristics limited; AI flags content as ambiguous; low confidence result |
| Content in a non-English language | Keyword heuristics are less effective; AI handles multilingual content |
| Obfuscated text (spaces between chars, leet speak) | Normalisation step in the heuristic layer handles common substitutions |
| Clean URL with suspicious hosting (IP, fresh domain) | IP-as-host and domain-age signals fire independently of content |
| Known legitimate brand domain with phishing path | Domain age and Safe Browsing clear; AI analysis of path content is primary signal |
