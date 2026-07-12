import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Link2, Mail, MessageSquare, QrCode, Image, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';

const FEATURES = [
  { icon: Link2, label: 'URL Scanner', desc: 'Detect phishing links and malicious domains instantly.' },
  { icon: Mail, label: 'Email Scanner', desc: 'Analyse email content for social engineering attacks.' },
  { icon: MessageSquare, label: 'SMS Scanner', desc: 'Identify smishing attempts and fraudulent texts.' },
  { icon: QrCode, label: 'QR Scanner', desc: 'Decode and verify QR codes before following links.' },
  { icon: Image, label: 'Image OCR', desc: 'Extract and scan text from screenshots and images.' },
] as const;

const BENEFITS = [
  'Real-time threat detection',
  'AI-powered risk analysis',
  'Detailed scan reports',
  'Scan history & analytics',
] as const;

export default function LandingPage(): JSX.Element {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.22), transparent)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center gap-6"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-gradient sm:text-5xl">
            Protect yourself from scams with AI
          </h1>
          <p className="max-w-lg text-base text-text-secondary">
            ScamShield AI analyses URLs, emails, SMS, QR codes and images to detect phishing, fraud and
            malicious content before it harms you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button variant="outline" size="lg">Sign in</Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-text-muted">
            {BENEFITS.map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-2xl font-bold text-text-primary">Everything you need to stay safe</h2>
          <p className="text-text-secondary">Five scanners. One platform.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-5 transition-shadow hover:shadow-glow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">{label}</h3>
              <p className="text-xs text-text-muted">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-2xl px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-10"
        >
          <h2 className="mb-3 text-2xl font-bold text-text-primary">Start scanning for free</h2>
          <p className="mb-6 text-text-secondary">No credit card required.</p>
          <Link to={ROUTES.REGISTER}>
            <Button size="lg">
              Create your account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
