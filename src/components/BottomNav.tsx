import { Archive, BookOpen, Home, Images, Store, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/memory-box', label: 'Memory Box', icon: Images },
  { to: '/yourself', label: 'For Yourself', icon: UserRound },
  { to: '/scrapbooks', label: 'Scrapbooks', icon: BookOpen },
  { to: '/marketplace', label: 'Market', icon: Store },
  { to: '/keepsakes', label: 'Keepsakes', icon: Archive },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 mx-auto grid w-full grid-cols-6 gap-1 border-t border-keepsake-roseDeep/10 bg-white/90 px-2 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_35px_rgba(86,52,47,0.1)] backdrop-blur-xl md:hidden"
      aria-label="Primary navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            className={({ isActive }) =>
              [
                'grid min-h-[58px] min-w-0 place-items-center gap-1 rounded-xl px-1 text-center text-[0.58rem] font-bold leading-tight transition md:text-xs',
                isActive
                  ? 'bg-gradient-to-b from-keepsake-blush to-keepsake-sageSoft/70 text-keepsake-accentStrong shadow-soft'
                  : 'text-keepsake-muted hover:bg-keepsake-blush/60 hover:text-keepsake-accentStrong',
              ].join(' ')
            }
            key={item.to}
            to={item.to}
            end={item.to === '/'}
          >
            <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
            <span className="line-clamp-2">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
