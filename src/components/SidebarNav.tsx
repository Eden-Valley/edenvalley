import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileEdit,
  Users,
  UserPlus,
  DollarSign,
  Bot,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/blueprint', label: 'My Blueprint', icon: FileEdit },
  { to: '/dashboard/match', label: 'Find Match', icon: Users },
  { to: '/dashboard/team', label: 'My Team', icon: UserPlus },
  { to: '/dashboard/havila', label: 'Funding', icon: DollarSign },
  { to: '/dashboard/pischon', label: 'Pischon AI', icon: Bot },
] as const;

function SidebarNav() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-primary/10 bg-background">
      <NavLink
        to="/dashboard"
        className="flex flex-col items-center py-8"
      >
        <span className="font-display text-xs tracking-[0.3em] text-foreground">
          EDEN
        </span>
        <span className="font-display text-xs tracking-[0.3em] text-primary">
          VALLEY
        </span>
      </NavLink>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-body transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <footer className="border-t border-primary/10 px-6 py-4">
        <p className="text-xs text-muted-foreground">&copy; 2026 Eden Valley</p>
      </footer>
    </aside>
  );
}

export default SidebarNav;
