import { type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SidebarNav from './SidebarNav';
import UserNav from './UserNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex w-56 lg:w-64 flex-shrink-0">
        <SidebarNav />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-end border-b border-primary/10 px-4 lg:px-6">
          {user && (
            <UserNav
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              onSignOut={signOut}
            />
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
