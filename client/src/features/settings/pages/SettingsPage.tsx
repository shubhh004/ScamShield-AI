import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SettingsPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="mt-0.5 text-sm text-text-muted">Manage your account preferences</p>
      </div>
      <div className="max-w-lg">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <Input label="Full name" type="text" placeholder="John Doe" />
              <Input label="Email" type="email" placeholder="you@example.com" />
              <Button type="submit" variant="secondary" size="sm">Save changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
