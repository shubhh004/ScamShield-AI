# ScamShield AI — Brand Identity

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Approved |
| **Related** | [07_UI_System.md](./07_UI_System.md) |

---

## 1. Brand Positioning

ScamShield AI is a professional, AI-powered cybersecurity platform for individuals and businesses. It occupies the space between consumer antivirus tools (too simple) and enterprise security suites (too complex) — delivering professional-grade threat analysis through an interface anyone can use. The brand communicates competence, not fear; protection, not surveillance; intelligence, not opacity.

---

## 2. Brand Personality

| Trait | Meaning in Practice |
|-------|-------------------|
| **Trustworthy** | Consistent, honest, never overstates threats; earns confidence through accuracy |
| **Intelligent** | Results feel considered and precise, not formulaic; AI is visually present but never gimmicky |
| **Modern** | Contemporary aesthetic; avoids the dated "padlock + shield" visual clichés of legacy security software |
| **Minimal** | Interface recedes when results are clear; nothing competes with the risk assessment |
| **Reliable** | Fast, stable, and predictable; users return because they trust it will work |
| **Protective** | Tone and visual language communicate that the platform is on the user's side |

---

## 3. Visual Direction

- **Premium dark-first SaaS** — deep navy-to-black backgrounds with precisely placed light-source highlights; feels closer to a professional security dashboard than a consumer app
- **Clean layouts** — generous whitespace, left-aligned content, clear visual hierarchy; content density is controlled and never overwhelming
- **Glassmorphism — used sparingly** — frosted panels for overlapping UI layers (modals, popovers, sidebar) only; never applied as a default card style
- **Subtle depth** — shadows and surface layering create three-dimensional hierarchy without skeuomorphism; elements feel placed, not flat
- **Minimal gradients** — one accent gradient per screen maximum; directional (top-left to bottom-right); never rainbow or multi-stop
- **Colour discipline** — primary blue and secondary purple are the only brand accent colours; risk colours (green through red) are reserved for scan results exclusively

---

## 4. 3D Guidelines

3D elements are high-cost and high-impact. They are used selectively to create memorable moments, not as ambient decoration.

### Allowed

| Location | Purpose |
|----------|---------|
| **Hero section** | Rotating or subtly floating shield as the central brand mark |
| **Background** | Low-opacity particle network or geometric mesh; purely atmospheric, never interactive |
| **Dashboard welcome** | Single illustrative 3D element on first login or empty-state dashboard |
| **Empty states** | Contextual 3D illustration (e.g. magnifying glass for empty history, shield for first scan) |

### Not Allowed

| Rule | Reason |
|------|--------|
| Not on every page | Overuse reduces impact and increases bundle weight on every route |
| No heavy or complex scenes | Scene complexity must never compromise 60fps on mid-range hardware |
| Not behind authentication flows | Login and registration pages must load and render immediately |
| Not auto-playing with sound | No audio; no animation that cannot be paused |

3D scenes are loaded lazily via `React.lazy()` and are never on the critical render path.

---

## 5. Motion Principles

| Principle | Rule |
|-----------|------|
| **Purposeful** | Every animation communicates a state change or guides attention; no motion for decoration |
| **Fast** | No animation exceeds 300ms; loading states appear within 100ms of action |
| **Subtle** | Default easing is ease-out; nothing bounces, springs unexpectedly, or overshoots |
| **Non-distracting** | Motion never plays while the user is reading a result or making a decision |
| **Reduced motion** | All motion respects `prefers-reduced-motion`; brand identity does not depend on animation |

---

## 6. Iconography

| Rule | Detail |
|------|--------|
| **Primary library** | Lucide Icons — stroke-based, consistent 1.5 stroke width throughout the product |
| **Custom icons** | Security-specific concepts not in Lucide are drawn as SVGs following the same stroke style |
| **Stroke width** | 1.5 standard · 2.0 for error and warning states only |
| **No filled icons** | Filled variants are not used; they conflict with the outlined visual language |
| **No mixed libraries** | A single icon library per product; mixing libraries is not permitted |

---

## 7. Illustration Style

| Attribute | Standard |
|-----------|---------|
| **Style** | Minimal geometric line art — nodes, network edges, shield outlines, scan paths |
| **Subjects** | Shields, networks, data flows, AI neural patterns, magnifying glass, lock/unlock |
| **Colour** | Monochromatic using primary or secondary brand colours; never full-colour scenes |
| **Line weight** | Consistent with icon stroke width (1.5–2px equivalent at intended display size) |
| **Not allowed** | Cartoon characters, mascots, isometric scene overloads, hand-drawn aesthetics |
| **Complexity** | Illustrations are abstract enough to be themeable; no photorealistic elements |

---

## 8. Tone of Voice

| Attribute | Example |
|-----------|---------|
| **Clear** | "This URL has a high risk score." — not "Preliminary analysis suggests a non-negligible probability of phishing." |
| **Confident** | "This email is likely a phishing attempt." — not "This might possibly be suspicious." |
| **Helpful** | Results always include a plain-English reason and a suggested next action |
| **Professional** | No slang, no exclamation marks, no emoji in product copy |
| **Never alarming** | Risk is communicated factually; language does not escalate to create anxiety |
| **Never overly technical** | "Suspicious domain registered 2 days ago" — not "Low Alexa rank with recent RDAP creation date" |
| **Consistent** | "Scan" not "check" or "analyse"; "Risk Score" not "Threat Level" or "Danger Rating" |

---

## 9. Landing Page Vision

The marketing landing page communicates the product's value to a first-time visitor in under 10 seconds and moves them to create an account.

| Section | Content |
|---------|---------|
| **Hero** | Shield graphic (3D) · headline: one sentence on what ScamShield AI does · single CTA: "Scan for free" · no sign-up wall on the first scan |
| **How It Works** | Three-step visual: Paste → Analyse → Result · emphasises simplicity and speed |
| **Features** | Six scanner types shown as a feature grid · one icon, one label, one line each · no walls of text |
| **Trust Signals** | Scan count (live), accuracy metric, response time stat · factual, never hyperbolic |
| **Testimonials** | 3–4 short quotes from real users · role and use case included · no stock photography |
| **CTA** | Repeated at bottom · "Start scanning free" · no credit card, no commitment framing |
| **Footer** | Links: Docs, Privacy, Terms, Status, GitHub · minimal; no promotional content |

---

## 10. Decision Log

| Decision | Reason |
|----------|--------|
| Dark-first brand | Security professionals and power users expect dark interfaces; it signals seriousness |
| Blue + purple accent palette | Blue conveys trust and authority; purple signals AI and intelligence without cliché cyan |
| No shield-as-logo cliché | Every security product uses a shield; ScamShield AI's brand mark is the wordmark + minimal shield geometry |
| Glassmorphism only in overlay layers | Used as a depth signal, not a decoration; overuse makes it meaningless |
| 3D only at hero and empty states | High visual impact at entry moments; not a runtime tax on every page |
| Geometric line art over cartoon illustration | Appropriate for professional B2B/B2C context; ages better; matches icon language |
| Tone: confident without alarming | Users consult ScamShield AI when they are already uncertain; adding alarm is unhelpful |
| First scan without sign-up wall | Demonstrates value before asking for commitment; increases conversion to registration |

---

## 11. Conclusion

ScamShield AI's visual identity is built on restraint. The palette is constrained, the illustrations are abstract, the 3D moments are earned, and the tone never sensationalises. These constraints are not creative limitations — they are what separates a trustworthy security platform from a security product that feels anxious and overcrowded. Consistency across every screen, every word, and every animation is what makes the brand recognisable and credible.

---

| | |
|---|---|
| **Document Status** | Approved |
| **Version** | 1.0 |
| **Owner** | Engineering Team |
| **Next Document** | [09_AI.md](./09_AI.md) |
