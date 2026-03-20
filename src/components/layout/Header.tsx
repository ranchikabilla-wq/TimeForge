import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutGrid, Save, Sun, Moon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';

const NAV_ITEMS = [
  { to: '/home', label: 'Home' },
  { to: '/generator', label: 'Generator' },
  { to: '/saved', label: 'Saved' },
];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  function handleLogout() {
    localStorage.removeItem('timeforge-auth');
    navigate('/login');
  }

  return (
    <header className="no-print sticky top-0 z-40 surface-low">
      <div className="flex items-center justify-between px-5 lg:px-8 h-14">
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-all group-hover:scale-105 glow-primary">
            <Sparkles className="size-4.5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base leading-tight tracking-tight">
              <span className="text-primary">Time</span><span className="text-foreground">Forge</span>
            </span>
            <span className="label-system text-muted-foreground leading-none hidden sm:block">Kinetic Precision</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-0.5">
            {NAV_ITEMS.map(({ to, label }) => {
              const isActive = pathname === to || (to === '/generator' && pathname === '/timetable');
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'px-4 py-2 text-sm font-display font-medium transition-all rounded-lg',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                  {isActive && <div className="h-0.5 bg-primary rounded-full mt-0.5" />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-3 flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center size-9 rounded-xl surface-high text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center size-9 rounded-xl surface-high text-muted-foreground hover:text-destructive transition-all hover:scale-105 active:scale-95"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
