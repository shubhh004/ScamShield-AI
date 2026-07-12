import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { ROUTES } from '@/constants/routes';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import * as authService from '@/services/auth.service';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .max(72, 'Password is too long')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a digit')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string } } | undefined;
    return data?.error?.message ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

interface StrengthInfo {
  score: number;
  label: string;
  barColor: string;
  textColor: string;
}

function getStrength(pw: string): StrengthInfo {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: score === 0 ? '' : 'Weak', barColor: 'bg-danger', textColor: 'text-danger' };
  if (score === 2) return { score, label: 'Fair', barColor: 'bg-warning', textColor: 'text-warning' };
  if (score === 3) return { score, label: 'Good', barColor: 'bg-yellow-400', textColor: 'text-yellow-400' };
  return { score, label: 'Strong', barColor: 'bg-success', textColor: 'text-success' };
}

function PasswordStrength({ password }: { password: string }): JSX.Element | null {
  if (password.length === 0) return null;
  const { score, label, barColor, textColor } = getStrength(password);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? barColor : 'bg-bg-elevated'}`}
          />
        ))}
      </div>
      {label.length > 0 && <p className={`text-xs font-medium ${textColor}`}>{label}</p>}
    </div>
  );
}

export default function RegisterPage(): JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordValue = watch('password', '');

  async function onSubmit(values: FormValues): Promise<void> {
    setApiError('');
    try {
      const { user, accessToken } = await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      login(user, accessToken);
      toast.success('Account created! Welcome to ScamShield AI.');
      void navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setApiError(getApiError(err));
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-text-primary">Create account</h1>
          <p className="mt-1 text-sm text-text-muted">Start protecting yourself with ScamShield AI</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Full name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, uppercase, digit, symbol"
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[34px] text-text-muted hover:text-text-secondary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={passwordValue} />
          </div>

          <div className="relative">
            <Input
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              className="pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-[34px] text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {apiError.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-xs text-danger"
            >
              {apiError}
            </motion.p>
          )}

          <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-text-muted">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
