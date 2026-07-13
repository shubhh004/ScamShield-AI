import { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
  useMotionValue,
} from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Shield,
  Link2,
  Mail,
  MessageSquare,
  QrCode,
  Image,
  Cpu,
  Upload,
  Zap,
  FileText,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CardDatum {
  icon: LucideIcon;
  label: string;
  preview: string;
  badge: string;
  color: 'danger' | 'warning';
  score: number;
}

interface TrustItem {
  icon: LucideIcon;
  text: string;
}

interface FeedItem {
  id: number;
  icon: LucideIcon;
  typeLabel: string;
  target: string;
  result: string;
  risk: 'HIGH' | 'MEDIUM' | 'SAFE';
  timeAgo: string;
}

interface TimelineStep {
  number: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  desc: string;
}

// ── Constants & Data ──────────────────────────────────────────────────────────

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const SCANNER_CARDS: CardDatum[] = [
  { icon: Link2,         label: 'URL Scanner',  preview: 'paypa1-secure.com/login',    badge: 'HIGH RISK',  color: 'danger',  score: 91 },
  { icon: Mail,          label: 'Email Scanner', preview: 'noreply@g00gle-verify.net',  badge: 'PHISHING',   color: 'danger',  score: 87 },
  { icon: MessageSquare, label: 'SMS Scanner',   preview: '"You\'ve won ₹50,000!"',      badge: 'SCAM',       color: 'danger',  score: 78 },
  { icon: QrCode,        label: 'QR Scanner',    preview: 'bit.ly/claim-prize-2024',     badge: 'SUSPICIOUS', color: 'warning', score: 55 },
  { icon: Image,         label: 'Image OCR',     preview: '"Enter your OTP to verify…"', badge: 'OTP SCAM',   color: 'danger',  score: 82 },
];

const TRUST_ITEMS: TrustItem[] = [
  { icon: CheckCircle, text: 'No credit card required' },
  { icon: Zap,         text: 'Instant analysis' },
  { icon: Shield,      text: 'Free plan available' },
];

const SCAN_FEED: FeedItem[] = [
  { id: 1, icon: Link2,         typeLabel: 'URL',   target: 'paypa1-secure.com',    result: 'HIGH RISK',  risk: 'HIGH',   timeAgo: '2s ago' },
  { id: 2, icon: Mail,          typeLabel: 'Email', target: 'noreply@g00gle.net',   result: 'PHISHING',   risk: 'HIGH',   timeAgo: '9s ago' },
  { id: 3, icon: MessageSquare, typeLabel: 'SMS',   target: '"WIN ₹50,000 NOW!"',   result: 'SCAM',       risk: 'HIGH',   timeAgo: '23s ago' },
  { id: 4, icon: QrCode,        typeLabel: 'QR',    target: 'bit.ly/claim-prize',   result: 'SUSPICIOUS', risk: 'MEDIUM', timeAgo: '41s ago' },
  { id: 5, icon: Link2,         typeLabel: 'URL',   target: 'github.com/anthropics', result: 'SAFE',      risk: 'SAFE',   timeAgo: '58s ago' },
  { id: 6, icon: Image,         typeLabel: 'OCR',   target: '"Enter OTP to verify"', result: 'OTP SCAM', risk: 'HIGH',   timeAgo: '1m ago' },
];

const RISK_DIST = [
  { label: 'HIGH',   pct: 62, cls: 'bg-danger',  text: 'text-danger' },
  { label: 'MEDIUM', pct: 28, cls: 'bg-warning',  text: 'text-warning' },
  { label: 'LOW',    pct: 10, cls: 'bg-success',  text: 'text-success' },
] as const;

const TIMELINE_STEPS: TimelineStep[] = [
  { number: '01', icon: Upload,   title: 'Submit Content',      subtitle: 'Any format',        desc: 'Paste a URL, email text, SMS, QR image, or screenshot — we handle every threat vector.' },
  { number: '02', icon: Cpu,      title: 'Deep Scanning',       subtitle: '11+ rule checks',   desc: 'Multi-layer analysis engine checks for phishing, typosquatting, brand impersonation and more.' },
  { number: '03', icon: Zap,      title: 'Risk Scoring',        subtitle: '0 – 100 scale',     desc: 'Each signal is weighted and combined into a calibrated risk score with confidence percentage.' },
  { number: '04', icon: FileText, title: 'AI Explanation',      subtitle: 'Plain language',    desc: 'Claude-powered AI explains exactly what it found and why it is dangerous, in plain English.' },
  { number: '05', icon: ShieldCheck, title: 'Stay Protected',   subtitle: 'Full history',      desc: 'Every scan is logged with full results, AI insights, and exportable reports.' },
];

// ── Particles (stable, pre-computed) ─────────────────────────────────────────

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${((i * 37 + 11) % 91) + 2}%`,
  top:  `${((i * 53 +  7) % 85) + 5}%`,
  size: i % 3 === 0 ? 2.5 : i % 3 === 1 ? 1.5 : 2,
  delay: (i * 0.4) % 4,
  duration: 3 + (i % 5),
}));

// ── Animation helpers ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE_OUT_EXPO },
});

const revealUp = {
  initial:    { opacity: 0, y: 22 },
  whileInView:{ opacity: 1, y: 0 },
  viewport:   { once: true as const, margin: '-50px' },
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useCountUp(end: number, inView: boolean): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView || end === 0) return;
    let frame: number;
    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - t, 3)) * end));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, inView]);
  return value;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function HeroBg({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 130% 90% at 50% -10%, #0c1a52 0%, #07102a 38%, #09090b 68%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <motion.div
        className="absolute -left-48 -top-32 h-[640px] w-[640px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 65%)', filter: 'blur(88px)' }}
        animate={reduced ? {} : { x: [0, 50, -25, 0], y: [0, -35, 25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 65%)', filter: 'blur(100px)' }}
        animate={reduced ? {} : { x: [0, -35, 20, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: 6 }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 h-[380px] w-[380px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 65%)', filter: 'blur(72px)' }}
        animate={reduced ? {} : { x: [0, 25, -30, 0], y: [0, -20, 12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 12 }}
      />
      {!reduced && (
        <motion.div
          className="absolute inset-x-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(37,99,235,0.35) 40%, rgba(99,102,241,0.25) 60%, transparent 95%)' }}
          initial={{ top: '-2px', opacity: 0 }}
          animate={{ top: ['0%', '100%'], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: 8, repeat: Infinity, repeatDelay: 6, ease: 'linear', times: [0, 0.04, 0.96, 1] }}
        />
      )}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, opacity: 0 }}
          animate={reduced ? { opacity: 0.2 } : { opacity: [0, 0.5, 0], y: [0, -14, 0] }}
          transition={reduced ? {} : { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.016]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.18) 3px, rgba(255,255,255,0.18) 4px)',
          backgroundSize: '100% 4px',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: 'linear-gradient(to top, #09090b 0%, transparent 100%)' }} />
    </div>
  );
}

function AiCore({ reduced }: { reduced: boolean }): JSX.Element {
  const ORBIT = 76;
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {!reduced && [0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/20"
          style={{ width: 96, height: 96 }}
          animate={{ scale: [1, 1.55 + i * 0.25], opacity: [0.4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: i * 1.1 }}
        />
      ))}
      <div className="absolute rounded-full border border-primary/20" style={{ width: ORBIT, height: ORBIT }} />
      {!reduced && [0, 120, 240].map((startDeg, i) => (
        <motion.div
          key={i}
          className="absolute flex items-start justify-center"
          style={{ width: ORBIT, height: ORBIT }}
          animate={{ rotate: [startDeg, startDeg + 360] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        >
          <div className="h-1.5 w-1.5 -translate-y-[3px] rounded-full bg-primary" style={{ boxShadow: '0 0 6px rgba(37,99,235,0.9)' }} />
        </motion.div>
      ))}
      <motion.div
        className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-primary/40"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0.05) 100%)' }}
        animate={reduced ? {} : { scale: [1, 1.07, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="h-2.5 w-2.5 rounded-full bg-primary"
          style={{ boxShadow: '0 0 10px rgba(37,99,235,1), 0 0 22px rgba(37,99,235,0.5)' }}
          animate={reduced ? {} : { opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

const HERO_BADGE_STYLE = {
  danger:  { wrap: 'bg-danger/10 text-danger',  dot: 'bg-danger',  bar: 'bg-danger',  glow: 'rgba(239,68,68,0.4)' },
  warning: { wrap: 'bg-warning/10 text-warning', dot: 'bg-warning', bar: 'bg-warning', glow: 'rgba(245,158,11,0.4)' },
} as const;

function ScannerCard({ data, index, reduced }: { data: CardDatum; index: number; reduced: boolean }): JSX.Element {
  const { icon: Icon, label, preview, badge, color, score } = data;
  const s = HERO_BADGE_STYLE[color];
  const floatY = index % 2 === 0 ? -7 : 5;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.75 + index * 0.1, ease: EASE_OUT_EXPO }}
    >
      <motion.div
        className="group relative cursor-default overflow-hidden rounded-xl border border-border/50 p-4"
        style={{ background: 'rgba(15,15,20,0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
        animate={reduced ? {} : { y: [0, floatY, 0] }}
        transition={{ duration: 3.6 + index * 0.7, delay: index * 0.45, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={reduced ? {} : { y: floatY - 6, borderColor: s.glow.replace('0.4)', '0.35)'), transition: { duration: 0.18 } }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, ${s.glow}, transparent)` }} />
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-text-primary">{label}</span>
        </div>
        <p className="mb-3 truncate font-mono text-[10px] text-text-muted">{preview}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.wrap}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {badge}
            </span>
            <span className="font-mono text-[10px] text-text-muted">{score}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-bg-elevated">
            <motion.div className={`h-1 rounded-full ${s.bar}`}
              initial={{ width: 0 }} animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: 1 + index * 0.08, ease: 'easeOut' }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HeroVisual({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      <ScannerCard data={SCANNER_CARDS[0]!} index={0} reduced={reduced} />
      <motion.div
        className="flex items-center justify-center rounded-xl border border-primary/15 py-2"
        style={{ background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: EASE_OUT_EXPO }}
      >
        <AiCore reduced={reduced} />
      </motion.div>
      <ScannerCard data={SCANNER_CARDS[1]!} index={1} reduced={reduced} />
      <ScannerCard data={SCANNER_CARDS[2]!} index={2} reduced={reduced} />
      <ScannerCard data={SCANNER_CARDS[3]!} index={3} reduced={reduced} />
      <ScannerCard data={SCANNER_CARDS[4]!} index={4} reduced={reduced} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — FEATURES BENTO GRID
// ═══════════════════════════════════════════════════════════════════════════════

function UrlScannerDemo(): JSX.Element {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-danger/20 bg-bg-elevated/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
          <span className="font-mono text-[11px] text-text-muted">paypa1-secure.com/login</span>
        </div>
        <span className="text-[10px] text-text-muted/50">Analysing…</span>
      </div>
      <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-bg">
        <motion.div
          className="h-1 rounded-full"
          style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
          initial={{ width: 0 }}
          whileInView={{ width: '91%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-[10px] font-semibold text-danger">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          HIGH RISK · 91%
        </span>
        <span className="rounded-full bg-bg px-2.5 py-0.5 text-[10px] text-text-muted">Typosquatting</span>
        <span className="rounded-full bg-bg px-2.5 py-0.5 text-[10px] text-text-muted">Brand Impersonation</span>
      </div>
    </div>
  );
}

function AiExplainPreview(): JSX.Element {
  return (
    <div className="flex-1 overflow-hidden rounded-xl border border-primary/20 bg-bg-elevated/60 p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-border/30 pb-3">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/15">
          <Cpu className="h-3 w-3 text-primary" />
        </div>
        <span className="text-xs font-medium text-primary">AI Analysis</span>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Completed
        </div>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-text-secondary">
        "This email exhibits multiple phishing indicators: sender domain mismatch, urgency language, and credential harvesting keywords. Confidence: 94%."
      </p>
      <div className="flex flex-wrap gap-1.5">
        {['Phishing', 'Urgency Language', 'Credential Theft'].map((tag) => (
          <span key={tag} className="rounded-full bg-danger/10 px-2.5 py-0.5 text-[10px] text-danger">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection({ reduced }: { reduced: boolean }): JSX.Element {
  const cardBase = 'h-full rounded-2xl border border-border/50 p-6 transition-all duration-200 hover:border-primary/25 hover:shadow-[0_0_28px_rgba(37,99,235,0.07)]';
  const cardBg   = { background: 'rgba(15,15,20,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' };

  const SMALL_FEATURES = [
    { icon: Mail,          label: 'Email Scanner',  desc: 'Analyse headers and body for social engineering, spoofed senders, and credential theft.' },
    { icon: MessageSquare, label: 'SMS Scanner',    desc: 'Identify smishing attempts, OTP theft, and fraudulent text messages instantly.' },
    { icon: QrCode,        label: 'QR Scanner',     desc: 'Decode QR codes and verify the embedded link before you ever open it.' },
    { icon: Image,         label: 'Image OCR',      desc: 'Extract and scan text from screenshots, invoices, and any image format.' },
  ];

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-28">
      {/* Dot-grid background identity */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Section header — left-aligned for rhythm */}
      <motion.div
        {...revealUp}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="mb-14 max-w-xl"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Coverage</p>
        <h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
          Every threat vector.
          <br />
          <span className="text-gradient">One platform.</span>
        </h2>
        <p className="text-base text-text-secondary">
          From a simple suspicious link to a complex multi-vector phishing campaign — ScamShield AI catches it.
        </p>
      </motion.div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">

        {/* Large: URL Scanner — col 1–7 */}
        <motion.div
          {...revealUp}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="md:col-span-7"
          whileHover={reduced ? {} : { y: -4, transition: { duration: 0.18 } }}
        >
          <div className={`group ${cardBase}`} style={cardBg}>
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 transition-colors group-hover:border-primary/35 group-hover:bg-primary/15">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-text-primary">URL Scanner</h3>
            <p className="text-sm leading-relaxed text-text-muted">
              Detect phishing links, typosquatting, brand impersonation, and malicious domains. Real-time analysis with 11+ detection rules.
            </p>
            <UrlScannerDemo />
          </div>
        </motion.div>

        {/* Small grid — col 8–12 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-5 md:grid-cols-1">
          {SMALL_FEATURES.slice(0, 2).map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              {...revealUp}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.06, ease: EASE_OUT_EXPO }}
              whileHover={reduced ? {} : { y: -3, transition: { duration: 0.18 } }}
            >
              <div className={`group ${cardBase}`} style={cardBg}>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 transition-colors group-hover:border-primary/35 group-hover:bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-text-primary">{label}</h3>
                <p className="text-xs leading-relaxed text-text-muted">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Row 2: QR + OCR side by side */}
        {SMALL_FEATURES.slice(2).map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={label}
            {...revealUp}
            transition={{ duration: 0.45, delay: 0.14 + i * 0.06, ease: EASE_OUT_EXPO }}
            whileHover={reduced ? {} : { y: -4, transition: { duration: 0.18 } }}
            className="md:col-span-6"
          >
            <div className={`group ${cardBase}`} style={cardBg}>
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 transition-colors group-hover:border-primary/35 group-hover:bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-text-primary">{label}</h3>
              <p className="text-xs leading-relaxed text-text-muted">{desc}</p>
            </div>
          </motion.div>
        ))}

        {/* Row 3: AI Explain — full width, horizontal */}
        <motion.div
          {...revealUp}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT_EXPO }}
          className="md:col-span-12"
        >
          <div
            className="group rounded-2xl border border-primary/15 p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(37,99,235,0.09)]"
            style={{ background: 'rgba(10,16,40,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
              {/* Left */}
              <div className="lg:w-[38%]">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 transition-colors group-hover:border-primary/40 group-hover:bg-primary/18">
                  <Cpu className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-text-primary">AI Explain</h3>
                <p className="text-sm leading-relaxed text-text-muted">
                  Every scan result comes with a plain-language AI explanation. Understand exactly what was found, why it is dangerous, and what to do next.
                </p>
              </div>
              {/* Right: demo */}
              <AiExplainPreview />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — LIVE INTELLIGENCE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

const RISK_COLOR: Record<FeedItem['risk'], string> = {
  HIGH:   'text-danger bg-danger/10',
  MEDIUM: 'text-warning bg-warning/10',
  SAFE:   'text-success bg-success/10',
};

function StatNumber({ end, display, label }: { end: number; display: (v: number) => string; label: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const count = useCountUp(end, inView);
  return (
    <div ref={ref} className="text-center">
      <p className="text-gradient-primary text-4xl font-bold tabular-nums sm:text-5xl">{display(count)}</p>
      <p className="mt-1.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function IntelligenceSection({ reduced }: { reduced: boolean }): JSX.Element {
  const [activeId, setActiveId] = useState(1);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setActiveId((prev) => (prev % SCAN_FEED.length) + 1), 2000);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <section
      className="relative overflow-hidden py-28"
      style={{ background: 'linear-gradient(180deg, #09090b 0%, #05091a 50%, #09090b 100%)' }}
    >
      {/* Subtle noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        aria-hidden="true"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          {...revealUp}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="mb-14 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Intelligence</p>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Live Threat Intelligence
            </h2>
          </div>
          <p className="max-w-xs text-sm text-text-secondary sm:text-right">
            Real-time scanning activity and threat distribution across all vectors.
          </p>
        </motion.div>

        {/* Dashboard grid */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Live scan feed — 2/5 */}
          <motion.div
            {...revealUp}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT_EXPO }}
            className="lg:col-span-2"
          >
            <div
              className="h-full rounded-2xl border border-border/50 p-5"
              style={{ background: 'rgba(15,15,22,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            >
              {/* Feed header */}
              <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-4">
                <span className="text-sm font-semibold text-text-primary">Scan Activity</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full bg-success ${reduced ? '' : 'animate-pulse'}`} />
                  <span className="text-xs font-medium text-success">LIVE</span>
                </div>
              </div>

              {/* Feed items */}
              <div className="space-y-2">
                {SCAN_FEED.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-300"
                    animate={{
                      borderColor: item.id === activeId ? 'rgba(37,99,235,0.3)' : 'rgba(63,63,70,0.3)',
                      backgroundColor: item.id === activeId ? 'rgba(37,99,235,0.06)' : 'transparent',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
                      <item.icon className="h-3.5 w-3.5 text-text-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[11px] text-text-secondary">{item.target}</p>
                      <p className="text-[10px] text-text-muted">{item.typeLabel} · {item.timeAgo}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${RISK_COLOR[item.risk]}`}>
                      {item.result}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats + distribution — 3/5 */}
          <div className="flex flex-col gap-6 lg:col-span-3">

            {/* Stats row */}
            <motion.div
              {...revealUp}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT_EXPO }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { end: 99, display: (v: number) => `${v}%`,  label: 'Detection Accuracy' },
                { end: 50, display: (v: number) => `${v}K+`, label: 'Threats Analysed' },
                { end: 0,  display: (_: number) => '24/7',   label: 'AI Protection' },
              ].map(({ end, display, label }) => (
                <div
                  key={label}
                  className="relative overflow-hidden rounded-2xl border border-border/50 p-5"
                  style={{ background: 'rgba(15,15,22,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent)' }}
                  />
                  <StatNumber end={end} display={display} label={label} />
                </div>
              ))}
            </motion.div>

            {/* Risk distribution */}
            <motion.div
              {...revealUp}
              transition={{ duration: 0.5, delay: 0.16, ease: EASE_OUT_EXPO }}
              className="flex-1 rounded-2xl border border-border/50 p-6"
              style={{ background: 'rgba(15,15,22,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">Threat Distribution</p>
                <span className="text-xs text-text-muted">Last 30 days</span>
              </div>
              <div className="space-y-4">
                {RISK_DIST.map(({ label, pct, cls, text }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${text}`}>{label}</span>
                      <span className="tabular-nums text-text-muted">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
                      <motion.div
                        className={`h-2 rounded-full ${cls}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Scan type mini legend */}
              <div className="mt-6 border-t border-border/30 pt-5">
                <p className="mb-3 text-xs text-text-muted">Coverage by scan type</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'URL',   pct: 38 },
                    { label: 'Email', pct: 24 },
                    { label: 'SMS',   pct: 18 },
                    { label: 'QR',    pct: 11 },
                    { label: 'OCR',   pct: 9 },
                  ].map(({ label, pct }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span className="text-[10px] text-text-muted">{label}</span>
                      <span className="ml-auto text-[10px] tabular-nums text-text-muted/70">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — VERTICAL AI PIPELINE TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

function TimelineSection({ reduced }: { reduced: boolean }): JSX.Element {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: '-80px' });

  return (
    <section className="relative overflow-hidden py-28">
      {/* Horizontal line texture (different identity from other sections) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 39px, rgba(59,130,246,0.4) 39px, rgba(59,130,246,0.4) 40px)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Header */}
        <motion.div
          {...revealUp}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Process</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            The AI Pipeline
          </h2>
          <p className="mx-auto max-w-md text-text-secondary">
            From raw input to actionable threat intelligence in seconds.
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={lineRef} className="relative pl-16 sm:pl-20">
          {/* Animated vertical line */}
          <div className="pointer-events-none absolute left-4 top-4 w-px sm:left-5" style={{ bottom: '1.5rem' }} aria-hidden="true">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute inset-x-0 top-0"
                style={{ bottom: 0, background: 'linear-gradient(180deg, rgba(37,99,235,0.8) 0%, rgba(37,99,235,0.4) 60%, rgba(37,99,235,0.1) 100%)', transformOrigin: 'top' }}
                initial={{ scaleY: 0 }}
                animate={lineInView ? { scaleY: 1 } : {}}
                transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {TIMELINE_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: EASE_OUT_EXPO }}
              className={`relative flex gap-6 sm:gap-8 ${i < TIMELINE_STEPS.length - 1 ? 'pb-10' : ''}`}
            >
              {/* Step marker */}
              <div className="absolute -left-16 flex flex-col items-center sm:-left-20">
                <motion.div
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/40 bg-bg sm:h-10 sm:w-10"
                  whileInView={reduced ? {} : { borderColor: 'rgba(37,99,235,0.65)', backgroundColor: 'rgba(37,99,235,0.12)' }}
                  viewport={{ once: true }}
                  transition={reduced ? {} : { delay: i * 0.1 + 0.3 }}
                >
                  <step.icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                </motion.div>
              </div>

              {/* Content card */}
              <div
                className="flex-1 rounded-2xl border border-border/50 p-5 sm:p-6"
                style={{ background: 'rgba(15,15,20,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-primary">{step.number}</span>
                  <span className="text-[11px] text-text-muted">{step.subtitle}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-text-primary">{step.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          {...revealUp}
          transition={{ duration: 0.45, delay: 0.3, ease: EASE_OUT_EXPO }}
          className="mt-10 text-center text-xs text-text-muted"
        >
          Average analysis time:{' '}
          <span className="font-semibold text-text-secondary">&lt; 800 ms</span>
          {' '}per scan
        </motion.p>
      </div>

    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — PREMIUM CTA WITH MOUSE PARALLAX
// ═══════════════════════════════════════════════════════════════════════════════

function CtaSection({ reduced }: { reduced: boolean }): JSX.Element {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const glowLeft = useTransform(mouseX, [0, 1], ['15%', '85%']);
  const glowTop  = useTransform(mouseY, [0, 1], ['15%', '85%']);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - r.left) / r.width);
      mouseY.set((e.clientY - r.top) / r.height);
    },
    [mouseX, mouseY],
  );

  const handleLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 pb-28">
      <motion.div
        {...revealUp}
        transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
      >
        <div
          className="relative overflow-hidden rounded-3xl border border-primary/20 p-14 text-center sm:p-20"
          style={{
            background: 'radial-gradient(ellipse 100% 120% at 50% 120%, rgba(37,99,235,0.22), rgba(6,10,26,0.97))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onMouseMove={reduced ? undefined : handleMove}
          onMouseLeave={reduced ? undefined : handleLeave}
        >
          {/* Mouse-reactive aurora glow */}
          {!reduced && (
            <motion.div
              className="pointer-events-none absolute h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: glowLeft,
                top: glowTop,
                background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)',
                filter: 'blur(48px)',
              }}
            />
          )}

          {/* Top border glow */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.85), transparent)' }}
            aria-hidden="true"
          />

          {/* Grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            aria-hidden="true"
            style={{
              backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary"
              style={{ boxShadow: '0 0 44px rgba(37,99,235,0.55)' }}
              animate={reduced ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>

            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                Start protecting
                <br />
                <span className="text-gradient-primary">yourself today.</span>
              </h2>
              <p className="mx-auto max-w-sm text-text-secondary">
                Join thousands of users who trust ScamShield AI to keep them safe online. Free forever.
              </p>
            </div>

            <motion.div
              whileHover={reduced ? {} : { scale: 1.04, y: -3 }}
              whileTap={reduced ? {} : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <Link to={ROUTES.REGISTER}>
                <Button
                  size="lg"
                  className="px-10 shadow-[0_0_30px_rgba(37,99,235,0.32)] transition-shadow duration-300 hover:shadow-[0_0_55px_rgba(37,99,235,0.55)]"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success/60" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success/60" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success/60" />
                Free plan forever
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function LandingPage(): JSX.Element {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() === true;

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden pb-12 pt-24"
      >
        <HeroBg reduced={prefersReducedMotion} />

        <motion.div
          className="relative z-10 flex w-full flex-col items-center gap-6 px-6"
          style={{ y: prefersReducedMotion ? undefined : contentY }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              AI-Powered Cyber Intelligence Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="max-w-4xl text-center text-5xl font-bold leading-[1.06] tracking-tight text-gradient sm:text-6xl lg:text-[4.75rem]"
          >
            Detect Scams Before
            <br className="hidden sm:block" />
            {' '}They Detect You.
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="max-w-lg text-center text-base leading-relaxed text-text-secondary sm:text-lg">
            Advanced AI threat detection for URLs, emails, SMS, QR codes and images — analysed in seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4">
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.04, y: -3 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <Link to={ROUTES.REGISTER}>
                <Button size="lg" className="px-8 shadow-[0_0_28px_rgba(37,99,235,0.28)] transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(37,99,235,0.5)]">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.03, y: -3 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <Link to={ROUTES.LOGIN}>
                <div className="animated-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="rounded-lg px-8 text-text-primary transition-all duration-200 hover:bg-primary/6 hover:text-text-primary"
                  >
                    Live Demo
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-text-muted">
            {TRUST_ITEMS.map(({ icon: Icon, text }, i) => (
              <span key={text} className="flex items-center gap-1.5">
                {i > 0 && <span className="hidden h-3 w-px bg-border sm:block" />}
                <Icon className="h-3.5 w-3.5 text-primary/60" />
                {text}
              </span>
            ))}
          </motion.div>

          {/* Floating scanner cards */}
          <motion.div {...fadeUp(0.5)} className="mt-4 w-full">
            <HeroVisual reduced={prefersReducedMotion} />
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.7 }}
          className="absolute bottom-8 z-10 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Scroll</span>
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="h-7 w-px bg-gradient-to-b from-primary/50 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Section 2: Features bento ─────────────────────────────────── */}
      <FeaturesSection reduced={prefersReducedMotion} />

      {/* ── Section 3: Live intelligence ──────────────────────────────── */}
      <IntelligenceSection reduced={prefersReducedMotion} />

      {/* ── Section 4: AI pipeline timeline ───────────────────────────── */}
      <TimelineSection reduced={prefersReducedMotion} />

      {/* ── Section 5: Premium CTA ────────────────────────────────────── */}
      <CtaSection reduced={prefersReducedMotion} />

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 py-10 sm:flex-row sm:justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-[0_0_12px_rgba(37,99,235,0.4)]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">ScamShield AI</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
              <ExternalLink className="h-3 w-3" />
              GitHub
            </a>
            <a href="#" className="transition-colors hover:text-text-primary">Privacy</a>
            <a href="#" className="transition-colors hover:text-text-primary">Terms</a>
            <span className="text-text-muted/60">© 2026 ScamShield AI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
