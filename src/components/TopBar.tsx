import { Link, NavLink } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';

const desktopNavItems = [
  { to: '/', label: 'Home' },
  { to: '/memory-box', label: 'Memory Box' },
  { to: '/scrapbooks', label: 'Scrapbooks' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/keepsakes', label: 'Keepsakes' },
];

export function TopBar() {
  return (
    <header className="ks-topbar sticky top-0 z-10 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] md:min-h-[88px] md:px-6 xl:px-8">
        <Link
          className="ks-topbar-brand inline-flex min-h-11 shrink-0 items-center gap-3 font-heading text-[1.7rem] font-bold leading-none md:text-[1.9rem] lg:text-[2.15rem]"
          to="/"
          aria-label="Keepsake home"
        >
          <img
            className="h-11 w-11 rounded-2xl object-cover shadow-soft ring-1 ring-keepsake-gold/30 md:h-12 md:w-12"
            src="/keepsake-logo.png"
            alt=""
            aria-hidden="true"
          />
          Keepsake
        </Link>
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
          <nav className="flex min-w-0 items-center justify-center gap-1 lg:gap-2" aria-label="Desktop navigation">
            {desktopNavItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-extrabold leading-none transition active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-accentStrong/45 lg:px-3.5 xl:px-4',
                    isActive
                    ? 'ks-topbar-link-active shadow-soft'
                    : 'ks-topbar-link hover:bg-white/75 hover:shadow-soft',
                  ].join(' ')
                }
                end={item.to === '/'}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <ThemeSwitcher />
        <NavLink
          className={({ isActive }) =>
            [
              'rounded-full px-3 py-2 text-xs font-extrabold transition md:hidden',
              isActive
                ? 'ks-topbar-link-active'
                : 'ks-topbar-link bg-white/70 shadow-soft hover:bg-keepsake-blush',
            ].join(' ')
          }
          to="/keepsakes"
        >
          My Keepsakes
        </NavLink>
      </div>
    </header>
  );
}
