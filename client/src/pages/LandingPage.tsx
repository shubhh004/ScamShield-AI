import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Link2,
    label: 'URL Scanner',
    desc: 'Detect phishing links and malicious domains before you click.',
  },
  {
    icon: Mail,
    label: 'Email Scanner',
    desc: 'Analyse email headers and content for social engineering attacks.',
  },
  {
    icon: MessageSquare,
    label: 'SMS Scanner',
    desc: 'Identify smishing attempts and fraudulent text messages instantly.',
  },
  {
    icon: QrCode,
    label: 'QR Scanner',
    desc: 'Decode and verify QR codes before following any embedded links.',
  },
  {
    icon: Image,
    label: 'Image OCR',
    desc: 'Extract and scan text from screenshots, receipts and images.',
  },
  {
    icon: Cpu,
    label: 'AI Explain',
    desc: 'Get plain-language AI explanations of every detected threat.',
  },
] as const;

const STATS = [
  { value: '99%', label: 'Detection Accuracy' },
  { value: '50K+', label: 'Threats Analysed' },
  { value: '24/7', label: 'AI Protection' },
] as const;

const STEPS = [
  {
    icon: Upload,
    number: '1',
    title: 'Upload',
    desc: 'Submit a URL, email, SMS, QR code or image for analysis.',
  },
  {
    icon: Zap,
    number: '2',
    title: 'AI Analysis',
    desc: 'Our engine scores threats across multiple risk factors in real-time.',
  },
  {
    icon: FileText,
    number: '3',
    title: 'Threat Report',
    desc: 'Receive a detailed risk report with confidence scores and insights.',
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage(): JSX.Element {
  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        {/* Background gradients */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(37,99,235,0.30), transparent)',
          }}
        />
        <div
          className="pointer-events-none absolute left-1/4 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(37,99,235,0.08)' }}
        />
        <div
          className="pointer-events-none absolute right-1/4 top-1/3 h-64 w-64 translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(124,58,237,0.08)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 flex flex-col items-center gap-7"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex h-18 w-18 items-center justify-center rounded-2xl bg-primary shadow-glow"
            style={{ width: '4.5rem', height: '4.5rem' }}
          >
            <Shield className="h-9 w-9 text-white" />
          </motion.div>

          {/* Pill badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            <ShieldCheck className="h-3 w-3" />
            AI-Powered Scam Detection
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="max-w-3xl text-4xl font-bold leading-tight text-gradient sm:text-5xl lg:text-6xl"
          >
            Detect Online Scams Before They Detect You.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="max-w-xl text-base text-text-secondary sm:text-lg"
          >
            AI-powered scam detection for URLs, Emails, SMS, QR Codes and Images.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link to={ROUTES.REGISTER}>
              <Button size="lg">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button variant="outline" size="lg">
                Live Demo
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="absolute bottom-10 flex flex-col items-center gap-1.5"
        >
          <span className="text-xs text-text-muted">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="h-5 w-px bg-border"
          />
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-2xl font-bold text-text-primary sm:text-3xl">
            Six Ways to Stay Protected
          </h2>
          <p className="text-text-secondary">One platform. Every threat vector covered.</p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass group cursor-default rounded-xl border border-border/50 p-6 transition-shadow hover:border-primary/30 hover:shadow-glow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">{label}</h3>
              <p className="text-xs leading-relaxed text-text-muted">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why ScamShield ───────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.09), transparent)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-2xl font-bold text-text-primary sm:text-3xl">
            Why ScamShield?
          </h2>
          <p className="text-text-secondary">Numbers that speak for themselves.</p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-3">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass relative overflow-hidden rounded-2xl border border-border/50 p-10 text-center"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)',
                }}
              />
              <p className="text-gradient-primary text-5xl font-bold sm:text-6xl">{value}</p>
              <p className="mt-3 text-sm text-text-secondary">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-2xl font-bold text-text-primary sm:text-3xl">
            How It Works
          </h2>
          <p className="text-text-secondary">Three steps to full protection.</p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, number, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.12 }}
              viewport={{ once: true }}
              className="glass flex flex-col items-center gap-4 rounded-xl border border-border/50 p-8 text-center"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-glow-sm">
                  {number}
                </span>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">{title}</h3>
                <p className="text-xs leading-relaxed text-text-muted">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 p-12 text-center"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 50% 110%, rgba(37,99,235,0.20), rgba(24,24,27,0.80))',
          }}
        >
          {/* Top border glow */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(37,99,235,0.6), transparent)',
            }}
          />

          <div className="relative flex flex-col items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-glow">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Start Protecting Yourself Today
            </h2>
            <p className="max-w-sm text-text-secondary">
              Join thousands of users who trust ScamShield AI to keep them safe online.
            </p>
            <Link to={ROUTES.REGISTER}>
              <Button size="lg">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-10 sm:flex-row sm:justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">ScamShield AI</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-text-primary"
            >
              <ExternalLink className="h-3 w-3" />
              GitHub
            </a>
            <a
              href="#"
              className="transition-colors hover:text-text-primary"
            >
              Privacy
            </a>
            <span>Made with ❤️</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
