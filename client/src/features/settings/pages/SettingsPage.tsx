import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Shield, Sliders, LogOut, Trash2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import * as authService from '@/services/auth.service';
import { getApiError } from '@/utils/apiError';

// ── Schemas ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Enter a valid email address').max(254, 'Email is too long'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .max(72, 'Password is too long')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a digit')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFields = z.infer<typeof profileSchema>;
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
  const { user, logout, updateUser } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Delete account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Profile form ───────────────────────────────────────────────────────────

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting, isDirty: profileDirty },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  // Re-sync defaults when user loads (e.g. page refresh)
  useEffect(() => {
    if (user !== null) {
      resetProfile({ name: user.name, email: user.email });
    }
  }, [user, resetProfile]);

  async function onSubmitProfile(values: ProfileFields): Promise<void> {
    try {
      const updated = await authService.updateProfile({ name: values.name, email: values.email });
      updateUser(updated);
      resetProfile({ name: updated.name, email: updated.email });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(getApiError(err));
    }
  }

  // ── Password form ──────────────────────────────────────────────────────────

  const {
    register: regPw,
    handleSubmit: handlePw,
    reset: resetPw,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<PasswordFields>({ resolver: zodResolver(passwordSchema) });

  async function onSubmitPassword(values: PasswordFields): Promise<void> {
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      resetPw();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      toast.success('Password changed. Please log in again if prompted.');
    } catch (err) {
      toast.error(getApiError(err));
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    await logout();
  }

  // ── Delete account ─────────────────────────────────────────────────────────

  async function handleDeleteConfirm(): Promise<void> {
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      await logout();
    } catch (err) {
      toast.error(getApiError(err));
      setIsDeleting(false);
    }
  }

  const initials = user !== null ? getInitials(user.name) : '?';
  const canConfirmDelete = deleteConfirmText === 'DELETE';

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
              {/* Avatar + current info */}
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

              {/* Edit form */}
              <form onSubmit={handleProfile(onSubmitProfile)} noValidate className="flex flex-col gap-4">
                <Input
                  label="Full name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  error={profileErrors.name?.message}
                  {...regProfile('name')}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={profileErrors.email?.message}
                  {...regProfile('email')}
                />
                <div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    loading={profileSubmitting}
                    disabled={!profileDirty}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
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
              <Shield className="h-4 w-4 text-text-muted" />
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePw(onSubmitPassword)} noValidate className="flex flex-col gap-4">
                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={pwErrors.currentPassword?.message}
                    className="pr-10"
                    {...regPw('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-[34px] text-text-muted hover:text-text-secondary transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min 8 chars, uppercase, digit, symbol"
                    autoComplete="new-password"
                    error={pwErrors.newPassword?.message}
                    className="pr-10"
                    {...regPw('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-[34px] text-text-muted hover:text-text-secondary transition-colors"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    error={pwErrors.confirmPassword?.message}
                    className="pr-10"
                    {...regPw('confirmPassword')}
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

                <div>
                  <Button type="submit" variant="secondary" size="sm" loading={pwSubmitting}>
                    Change Password
                  </Button>
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
                  onClick={() => { setDarkMode((v) => !v); }}
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
                  onClick={() => { void handleLogout(); }}
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
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDeleteConfirmText('');
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      <Modal
        open={deleteModalOpen}
        onClose={() => { if (!isDeleting) setDeleteModalOpen(false); }}
        title="Delete Account"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-danger/20 bg-danger/8 p-3">
            <p className="text-sm text-text-secondary">
              This action is <span className="font-semibold text-danger">permanent</span>. Your
              account and all scan history will be deleted and cannot be recovered.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="delete-confirm" className="text-sm font-medium text-text-secondary">
              Type <span className="font-mono font-bold text-danger">DELETE</span> to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="input-textarea"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isDeleting}
              disabled={!canConfirmDelete}
              onClick={() => { void handleDeleteConfirm(); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
