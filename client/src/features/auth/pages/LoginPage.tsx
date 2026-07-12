import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage(): JSX.Element {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-text-primary">Welcome back</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in to your ScamShield account</p>
        </div>
        <form className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} />
          <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} />
          <Button type="submit" className="mt-1 w-full">Sign in</Button>
        </form>
        <p className="mt-5 text-center text-xs text-text-muted">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-primary hover:underline">Create one</Link>
        </p>
      </Card>
    </motion.div>
  );
}
