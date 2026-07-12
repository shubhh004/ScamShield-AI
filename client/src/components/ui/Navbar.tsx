import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import Button from './Button';

export default function Navbar(): JSX.Element {
  return (
    <nav className="fixed inset-x-0 top-0 z-40 glass-strong">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-text-primary">ScamShield AI</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
