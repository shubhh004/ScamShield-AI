import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Shield, Sliders, LogOut, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';

// ── Password schema (defined but form is disabled — no backend endpoint) ─────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a digit')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFields = z.infer<typeof passwordSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage(): JSX.Element {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    register,
    formState: { errors },
  } = useForm<PasswordFields>({ resolver: zodResolver(passwordSchema) });

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    await logout();
  }

  const initials = user !== null ? getInitials(user.name) : '?';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="mt-0.5 text-sm text-text-muted">Manage your account preferences</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-4">

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <User className="h-4 w-4 text-text-muted" />
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                  {initials}
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-base font-semibold text-text-primary">{user?.name ?? '—'}</p>
                  <p className="text-sm text-text-muted">{user?.email ?? '—'}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="primary">{user?.role.toUpperCase() ?? 'USER'}</Badge>
                    {user?.isEmailVerified === true ? (
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <XCircle className="mr-1 h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary">Update profile name or email</p>
                  <Badge variant="default">Coming Soon</Badge>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  Profile editing will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Security ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="default">Coming Soon</Badge>
                <Shield className="h-4 w-4 text-text-muted" />
              </div>
            </CardHeader>
            <CardContent>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  disabled
                  {...register('currentPassword')}
                  error={errors.currentPassword?.message}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  disabled
                  {...register('newPassword')}
                  error={errors.newPassword?.message}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  disabled
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
                <div className="flex items-center gap-3">
                  <Button type="submit" variant="secondary" size="sm" disabled>
                    Change Password
                  </Button>
                  <p className="text-xs text-text-muted">No backend endpoint available yet.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Preferences ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <Sliders className="h-4 w-4 text-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-text-primary">Dark Mode</p>
                  <p className="text-xs text-text-muted">UI only — preference is not persisted.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={darkMode}
                  onClick={() => {
                    setDarkMode((v) => !v);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    darkMode ? 'bg-primary' : 'bg-bg-elevated'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      darkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Account / Danger Zone ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-text-primary">Sign Out</p>
                  <p className="text-xs text-text-muted">End your current session.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={isLoggingOut}
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/5 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-danger">Delete Account</p>
                  <p className="text-xs text-text-muted">
                    Permanently remove your account and all data.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Coming Soon</Badge>
                  <Button variant="danger" size="sm" disabled>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
