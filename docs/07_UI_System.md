# ScamShield AI — UI System

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Approved |
| **Related** | [04_FolderStructure.md](./04_FolderStructure.md), [03_TechStack.md](./03_TechStack.md) |

---

## 1. Design Philosophy

ScamShield AI is a professional cybersecurity SaaS. Every UI decision reinforces three qualities: **trust**, **clarity**, and **authority**. Users arrive with a suspicious link or message and need to feel they are in capable hands within seconds.

| Principle | Application |
|-----------|------------|
| **Trustworthy** | Precise language, consistent visual weight, no decorative noise |
| **Clean** | Ample whitespace, one focal point per screen, no competing elements |
| **Modern** | Subtle depth, smooth transitions, contemporary type treatment |
| **Minimal** | Every element earns its place; decoration is never added for its own sake |
| **Accessible** | WCAG 2.1 AA minimum; keyboard-navigable; screen-reader compatible |
| **Decisive** | Risk results are never ambiguous — colour, label, and score align unambiguously |

---

## 2. Theme

**Dark mode is the primary and default theme.** The cybersecurity context — monitoring, analysis, threat detection — is naturally aligned with dark interfaces. Dark mode also reduces eye strain during extended sessions.

Light mode is fully supported and toggled via user preference, stored in `settings.defaultTheme`. The system respects `prefers-color-scheme` on first load.

| Mode | When Active |
|------|-------------|
| **Dark** | Default; active when no preference is stored |
| **Light** | Explicitly selected by user or when OS preference is light |

---

## 3. Color System

All colours are defined as CSS custom properties on `:root` and `:root[data-theme="light"]`. Components reference semantic tokens, never raw hex values.

### Semantic Tokens

| Token | Dark Mode | Light Mode | Purpose |
|-------|-----------|------------|---------|
| `--color-primary` | `#4F8EF7` | `#2563EB` | Interactive elements, links, primary actions |
| `--color-primary-hover` | `#3B7DE8` | `#1D4ED8` | Primary button hover state |
| `--color-secondary` | `#7C5CFC` | `#6D28D9` | Accent highlights, badges, AI indicators |
| `--color-success` | `#22C55E` | `#16A34A` | Safe scan results, confirmations |
| `--color-warning` | `#F59E0B` | `#D97706` | Medium risk, caution states |
| `--color-danger` | `#EF4444` | `#DC2626` | High / critical risk, destructive actions |
| `--color-info` | `#38BDF8` | `#0284C7` | Informational badges, tooltips |
| `--color-bg` | `#0D1117` | `#F8FAFC` | Page background |
| `--color-surface` | `#161B22` | `#FFFFFF` | Cards, panels, modals |
| `--color-surface-raised` | `#1C2330` | `#F1F5F9` | Hover states, nested surfaces |
| `--color-border` | `#30363D` | `#E2E8F0` | Dividers, input borders, card outlines |
| `--color-text-primary` | `#E6EDF3` | `#0F172A` | Headings, body text |
| `--color-text-secondary` | `#8B949E` | `#64748B` | Labels, placeholders, metadata |
| `--color-text-muted` | `#484F58` | `#94A3B8` | Disabled states, timestamps |

### Risk Category Colours

| Category | Colour | Usage |
|----------|--------|-------|
| Safe | `--color-success` (`#22C55E`) | Badge, meter fill, result heading |
| Low Risk | `#84CC16` | Badge, meter fill |
| Medium Risk | `--color-warning` (`#F59E0B`) | Badge, meter fill |
| High Risk | `--color-danger` (`#EF4444`) | Badge, meter fill |
| Critical | `#B91C1C` | Badge, meter fill, alert banner |

---

## 4. Typography

| Role | Font | Weight | Size Range |
|------|------|--------|-----------|
| **Display / Hero** | Inter | 700–800 | 36–60px |
| **Headings H1–H3** | Inter | 600–700 | 20–32px |
| **Subheadings H4–H6** | Inter | 500–600 | 14–18px |
| **Body** | Inter | 400 | 14–16px |
| **Labels / Captions** | Inter | 400–500 | 11–13px |
| **Button text** | Inter | 500–600 | 13–15px |
| **Code / Monospace** | JetBrains Mono | 400–500 | 12–14px |

- Type scale: **1.25 major third** ratio.
- Line height: `1.5` body · `1.2` headings.
- Letter spacing: `-0.01em` headings · `0.05em` all-caps labels.
- Code font applied to: displayed URLs, scan inputs, raw signals, API keys.

---

## 5. Spacing System

Base unit: **4px**. All spacing values are multiples of 4.

| Token | Value | Common Usage |
|-------|-------|-------------|
| `space-1` | 4px | Icon gaps, tight inline spacing |
| `space-2` | 8px | Badge padding, form field internals |
| `space-3` | 12px | List item gaps, compact sections |
| `space-4` | 16px | Card padding (mobile), button horizontal padding |
| `space-6` | 24px | Card padding (desktop), section gaps |
| `space-8` | 32px | Between major UI groups |
| `space-12` | 48px | Section heading to content |
| `space-16` | 64px | Page-level vertical rhythm |

---

## 6. Border Radius

| Token | Value | Applied To |
|-------|-------|-----------|
| `radius-sm` | 4px | Badges, chips, code snippets |
| `radius-md` | 8px | Buttons, inputs, dropdowns |
| `radius-lg` | 12px | Cards, panels, modals |
| `radius-xl` | 16px | Feature cards, large containers |
| `radius-full` | 9999px | Pills, avatar rings, spinners |

---

## 7. Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Subtle depth on small interactive elements on hover |
| `shadow-md` | Cards, dropdowns, tooltips |
| `shadow-lg` | Modals, elevated panels, popovers |
| `shadow-glow-primary` | Focus ring on primary actions; replaces default browser outline |
| `shadow-glow-danger` | Focus ring on destructive actions and critical risk cards |
| `shadow-glass` | Frosted-glass panels with translucent surface and backdrop blur |

Shadows in dark mode use colour-tinted umbra (dark blue-grey), never pure black.

---

## 8. Components

| Component | Variants |
|-----------|---------|
| **Button** | `primary`, `secondary`, `ghost`, `destructive`, `icon-only` · sizes: `sm`, `md`, `lg` |
| **Input** | `default`, `error`, `success`, `disabled` · types: text, password, search, file, textarea |
| **Card** | `default`, `elevated`, `bordered`, `interactive` (hover lift), `risk` (coloured left border) |
| **Badge** | Risk: `safe`, `low`, `medium`, `high`, `critical` · Status: `info`, `warning`, `neutral` · sizes: `sm`, `md` |
| **Modal** | `sm` (confirmation), `md` (form), `lg` (scan detail) · always focus-trapped, `Escape` dismisses |
| **Toast** | `success`, `error`, `warning`, `info` · auto-dismiss 5 s · stackable · position: bottom-right |
| **Table** | `default`, `striped`, `compact` · sortable headers · empty-state slot |
| **Navbar** | Fixed top · logo, scan-type switcher, notification bell, user avatar menu |
| **Sidebar** | Collapsible · `collapsed`: icon only · `expanded`: icon + label · active route highlighted |
| **Tabs** | `underline` (default), `pill` · arrow-key keyboard navigation |
| **Dropdown** | `default`, `multi-select` · virtualised at > 50 items · keyboard navigable |
| **Loader** | `spinner` (inline), `skeleton` (content placeholder), `progress-bar` (pipeline stages) |
| **RiskMeter** | Arc gauge 0–100 · colour transitions through the five risk categories |
| **ScanResultCard** | Composed: `Badge` + `RiskMeter` + `FlagList` + `ExplanationPanel` · shared across all scanner types |

---

## 9. Icons

Library: **Lucide Icons** — stroke-based SVG, individually tree-shaken.

| Context | Size | Stroke |
|---------|------|--------|
| Inline with body text | 16px | 1.5 |
| Buttons and inputs | 18px | 1.5 |
| Sidebar navigation | 20px | 1.5 |
| Section headings | 24px | 1.5 |
| Error / warning states | any | 2.0 |
| Hero / feature artwork | 32–48px | 1.5 |

- Every interactive icon-only element carries `aria-label`.
- Icons never convey meaning without an accompanying label or tooltip.
- Custom icons not in Lucide are added as SVG components in `client/src/components/icons/`.

---

## 10. Animations

Library: **Framer Motion**. All timing uses exponential ease-out curves. `useReducedMotion()` is checked globally — when enabled, all transitions collapse to instant state changes.

| Animation | Behaviour | Duration |
|-----------|-----------|---------|
| **Fade** | `opacity 0 → 1` on mount; reversed on unmount | 150ms |
| **Slide** | Translate + fade; direction matches context | 200ms |
| **Hover lift** | Card `translateY(-2px)` + shadow intensification | 100ms |
| **Scale** | `scale 0.97 → 1` on modal open | 200ms |
| **Page transition** | Cross-fade between routes | 150ms |
| **Skeleton shimmer** | Sweep left-to-right on placeholders | 1.5 s loop |
| **Risk meter fill** | Arc animates 0 → final score with spring easing | 800ms |
| **List stagger** | Items reveal sequentially | 40ms offset |

---

## 11. Responsive Breakpoints

| Breakpoint | Min Width | Key Layout Change |
|------------|-----------|------------------|
| `xs` | 0px | Single column · sidebar hidden · bottom navigation |
| `sm` | 480px | Wider card grids |
| `md` | 768px | Two-column result layout · sidebar as overlay |
| `lg` | 1024px | Persistent sidebar · content padding increases |
| `xl` | 1280px | Sidebar expanded by default · dashboard multi-column |
| `2xl` | 1536px | Content width capped at 1400px · no further layout change |

Components use **CSS container queries** (`@container`) for internal responsiveness. Breakpoints govern macro layout; container queries govern component-level adaptation.

---

## 12. Accessibility

| Requirement | Standard |
|-------------|---------|
| **Colour contrast** | ≥ 4.5:1 body text · ≥ 3:1 large text and UI components (WCAG 2.1 AA) |
| **Keyboard navigation** | All interactive elements reachable via Tab · modals trap focus · Escape closes overlays |
| **Focus states** | Visible focus ring using `shadow-glow-primary` on all elements · `outline: none` never used without replacement |
| **ARIA** | Semantic HTML first · ARIA roles and labels added only where native semantics are insufficient |
| **Screen readers** | Icon-only buttons carry `aria-label` · dynamic updates use `aria-live="polite"` |
| **Reduced motion** | `useReducedMotion()` respected globally · all animations collapse to instant state changes |
| **Colour independence** | Risk levels communicated with icon + label + colour — never colour alone |
| **Touch targets** | Minimum 44×44px on all interactive elements |

---

## 13. Decision Log

| Decision | Reason |
|----------|--------|
| Dark mode as default | Aligns with cybersecurity SaaS context; reduces eye strain in monitoring scenarios |
| Inter as primary typeface | Exceptional legibility at small sizes; excellent number rendering for scores and metrics; free and self-hostable |
| JetBrains Mono for code | Designed for developer tooling; clear disambiguation of similar characters (`0O`, `1lI`) |
| 4px spacing base unit | Aligns with Tailwind's default scale; prevents arbitrary spacing decisions |
| Semantic colour tokens over raw hex | Theme switching requires only token value changes, not component edits |
| Risk levels use colour + icon + label | Users with colour vision deficiency can identify risk category without relying on colour alone |
| Container queries for component responsiveness | Components adapt to their container, not the viewport — correct for a sidebar-based layout |
| Lucide Icons only, SVG fallback for custom | Consistent stroke style; tree-shaken; no font-loading dependency |

---

## 14. Conclusion

This UI system ensures that two engineers working on different features will produce visually and behaviourally consistent results without coordination overhead. Token-based colours, a strict spacing scale, a named component library, and documented animation timing create a single shared language for the entire interface. The system evolves by addition — new components follow the same token and variant conventions, and theme changes are made in one place.

---

| | |
|---|---|
| **Document Status** | Approved |
| **Version** | 1.0 |
| **Owner** | Engineering Team |
| **Next Document** | [08_BrandIdentity.md](./08_BrandIdentity.md) |
