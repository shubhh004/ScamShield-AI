import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage(): JSX.Element {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-text-primary">Create account</h1>
          <p className="mt-1 text-sm text-text-muted">Start protecting yourself with ScamShield AI</p>
        </div>
        <form className="flex flex-col gap-4">
          <Input label="Full name" type="text" placeholder="John Doe" leftIcon={<User className="h-4 w-4" />} />
          <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} />
          <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} hint="Minimum 8 characters" />
          <Button type="submit" className="mt-1 w-full">Create account</Button>
        </form>
        <p className="mt-5 text-center text-xs text-text-muted">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline">Sign in</Link>
        </p>
      </Card>
    </motion.div>
  );
}
