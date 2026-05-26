import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="ks-app-bg min-h-screen font-body text-keepsake-ink">
      <div className="relative flex min-h-screen w-full flex-col">
        <TopBar />
        <main className="ks-page-transition mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 md:px-8 md:py-10 md:pb-10">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
