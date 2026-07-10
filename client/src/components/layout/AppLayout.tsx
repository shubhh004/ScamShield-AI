import { Outlet } from 'react-router-dom';

export default function AppLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
