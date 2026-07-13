import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const CONTACT_EMAIL = 'chaurasiashubh195@gmail.com';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps): JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-text-secondary">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-bg pb-24 pt-28">
      <div className="mx-auto max-w-3xl px-6">
        {/* Back */}
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Title */}
        <div className="mb-12 mt-8 border-b border-border/60 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Privacy Policy</h1>
          <p className="mt-2 text-sm text-text-muted">Last updated: July 2026</p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-10">

          <Section title="1. Introduction">
            <p>
              ScamShield AI ("we", "us", or "our") is committed to protecting your privacy. This
              Privacy Policy explains what information we collect, how we use it, and the choices
              you have regarding your data when you use ScamShield AI (the "Service").
            </p>
            <p>
              By creating an account or using the Service, you agree to the collection and use of
              information as described in this policy. If you do not agree, please discontinue use
              of the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect only the information necessary to provide and improve the Service:</p>
            <ul className="ml-4 flex flex-col gap-1.5 text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                <span><strong className="text-text-primary">Account information</strong> — your name and email address when you register.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                <span><strong className="text-text-primary">Scan content</strong> — URLs, email text, SMS messages, QR code images, and screenshots you submit for analysis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                <span><strong className="text-text-primary">Usage data</strong> — scan history, risk scores, timestamps, and scan type metadata.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                <span><strong className="text-text-primary">Session data</strong> — authentication tokens managed via httpOnly cookies.</span>
              </li>
            </ul>
            <p>We do not collect payment information, location data, or any data beyond what is necessary to operate the Service.</p>
          </Section>

          <Section title="3. Authentication Data">
            <p>
              We use JSON Web Tokens (JWT) to authenticate users. Your refresh token is stored in a
              secure, httpOnly cookie that cannot be accessed by JavaScript. Your access token is
              held in memory only and never written to localStorage or sessionStorage.
            </p>
            <p>
              Your password is hashed using bcrypt before storage. We never store plaintext passwords
              and cannot recover them if lost. Passwords can be reset by contacting us directly.
            </p>
          </Section>

          <Section title="4. Scan Data">
            <p>
              Content you submit — including URLs, email bodies, SMS messages, QR code images, and
              screenshots — is processed by our server-side detection engine and stored as part of
              your scan history. This data is associated with your account and is not shared with
              other users.
            </p>
            <p>
              You may delete individual scan entries or clear your history at any time from the
              History page. We do not sell, rent, or monetise your scan data.
            </p>
          </Section>

          <Section title="5. AI Processing">
            <p>
              When you request an AI explanation for a scan result, the relevant scan data is sent
              to Groq's large language model (LLM) API for processing. This transmission is subject
              to Groq's own privacy policy and terms of service. We recommend reviewing their
              policies at groq.com if you have concerns about third-party data processing.
            </p>
            <p>
              AI-generated explanations are for informational purposes only and do not constitute
              professional security advice.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use a single httpOnly session cookie for authentication purposes. This cookie is
              strictly necessary for the Service to function and cannot be disabled while using the
              Service.
            </p>
            <p>
              We do not use advertising cookies, tracking pixels, or third-party analytics cookies.
              We do not participate in cross-site tracking.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the following rights regarding your personal data:</p>
            <ul className="ml-4 flex flex-col gap-1.5">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                <span><strong className="text-text-primary">Access</strong> — you can view all your scan history within the Service.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                <span><strong className="text-text-primary">Deletion</strong> — you can delete individual scan entries from the History page.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                <span><strong className="text-text-primary">Account deletion</strong> — you may request full account and data deletion by contacting us.</span>
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="8. Data Security">
            <p>
              We take reasonable technical measures to protect your data, including HTTPS encryption
              in transit, bcrypt password hashing, and httpOnly cookies for session management. No
              method of transmission over the internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>
            <p>
              In the event of a data breach that affects your personal information, we will notify
              you as required by applicable law.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your
              personal data, please contact us at:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </Section>

        </div>

        {/* Footer note */}
        <div className="mt-16 border-t border-border/60 pt-6">
          <p className="text-xs text-text-muted">
            This policy may be updated from time to time. Continued use of the Service after any
            changes constitutes acceptance of the revised policy.
          </p>
          <Link
            to={ROUTES.HOME}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
