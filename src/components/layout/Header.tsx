import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutGrid, Save, Sun, Moon, LogOut, Menu, X, Home, PenTool, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { supabase } from '@/supabaseClient';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/generator', label: 'Generator', icon: PenTool },
  { to: '/saved', label: 'Saved', icon: FolderOpen },
];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem('timeforge-auth');
    navigate('/login');
  }

  function NavLink({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: typeof Home; onClick?: () => void }) {
    const isActive = pathname === to || (to === '/generator' && pathname === '/timetable');
    return (
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 px-4 py-3 text-sm font-display font-medium transition-all rounded-lg',
          isActive
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-high'
        )}
      >
        <Icon className="size-4" />
        {label}
        {isActive && <div className="h-0.5 bg-primary rounded-full ml-auto" />}
      </Link>
    );
  }

  return (
    <header className="no-print sticky top-0 z-40 surface-low">
      <div className="flex items-center justify-between px-4 sm:px-5 lg:px-8 h-14">
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

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
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

        {/* Mobile Navigation - Hamburger Menu */}
        <div className="flex lg:hidden items-center gap-1">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center size-9 rounded-xl surface-high text-muted-foreground hover:text-foreground transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="flex items-center justify-center size-9 rounded-xl surface-high text-muted-foreground hover:text-foreground transition-all"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] surface-low p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-display font-bold text-lg">
                    <span className="text-primary">Time</span><span className="text-foreground">Forge</span>
                  </span>
                  <SheetClose asChild>
                    <button className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </SheetClose>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                  {NAV_ITEMS.map(({ to, label, icon }) => (
                    <SheetClose asChild key={to}>
                      <NavLink to={to} label={label} icon={icon} onClick={() => setMobileMenuOpen(false)} />
                    </SheetClose>
                  ))}
                </nav>
                <div className="p-4 border-t border-border">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-display font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
