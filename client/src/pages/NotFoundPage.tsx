import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card border border-border">
          <Shield className="h-8 w-8 text-text-muted" />
        </div>
        <div>
          <p className="text-6xl font-bold text-text-muted">404</p>
          <h1 className="mt-2 text-xl font-semibold text-text-primary">Page not found</h1>
          <p className="mt-1 text-sm text-text-muted">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
