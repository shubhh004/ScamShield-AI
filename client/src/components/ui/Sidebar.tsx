import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Link2,
  Mail,
  MessageSquare,
  QrCode,
  Image,
  History,
  BarChart2,
  Settings,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { useUIStore } from '@/store/uiStore';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  { label: 'URL Scanner', icon: Link2, to: ROUTES.SCAN_URL },
  { label: 'Email Scanner', icon: Mail, to: ROUTES.SCAN_EMAIL },
  { label: 'SMS Scanner', icon: MessageSquare, to: ROUTES.SCAN_SMS },
  { label: 'QR Scanner', icon: QrCode, to: ROUTES.SCAN_QR },
  { label: 'Image OCR', icon: Image, to: ROUTES.SCAN_IMAGE },
] as const;

const BOTTOM_ITEMS = [
  { label: 'History', icon: History, to: ROUTES.HISTORY },
  { label: 'Analytics', icon: BarChart2, to: ROUTES.ANALYTICS },
  { label: 'Settings', icon: Settings, to: ROUTES.SETTINGS },
] as const;

function NavItem({ label, icon: Icon, to, collapsed }: { label: string; icon: React.ElementType; to: string; collapsed: boolean }): JSX.Element {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <div
          className={cn(
            'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
            collapsed && 'justify-center px-2',
          )}
        >
          {isActive && !collapsed && (
            <span className="pointer-events-none absolute left-0 top-1/2 h-[18px] w-0.5 -translate-y-1/2 rounded-full bg-primary" />
          )}
          <Icon className="h-5 w-5 shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar(): JSX.Element {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 220 : 60 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex h-screen flex-col border-r border-border bg-bg-card py-4"
    >
      <div className={cn('mb-6 flex items-center gap-2.5 px-3', !sidebarOpen && 'justify-center px-2')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-[0_0_12px_rgba(37,99,235,0.35)]">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap text-sm font-bold text-text-primary"
            >
              ScamShield
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={!sidebarOpen} />
        ))}
        <div className="my-2 border-t border-border" />
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={!sidebarOpen} />
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg-card text-text-muted transition-colors hover:border-border-subtle hover:text-text-primary"
      >
        <motion.span animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <ChevronLeft className="h-3 w-3" />
        </motion.span>
      </button>
    </motion.aside>
  );
}
