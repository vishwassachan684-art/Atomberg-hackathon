'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface SidebarProps {
  currentPath?: string;
  userRole?: 'employee' | 'manager' | 'admin';
  userName?: string;
}

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/' },
  { label: 'My Goals', icon: 'flag', href: '/goals' },
  { label: 'Create Goal', icon: 'add_circle', href: '/goals/create' },
  { label: 'Check-ins', icon: 'fact_check', href: '/checkins' },
  { label: 'Reports', icon: 'bar_chart', href: '/reports' },
];

const managerItems = [
  { label: 'Team Review', icon: 'group', href: '/manager/review' },
  { label: 'Approvals', icon: 'approval', href: '/manager/approvals' },
];

const adminItems = [
  { label: 'Cycle Mgmt', icon: 'settings', href: '/admin/cycles' },
  { label: 'Audit Logs', icon: 'history', href: '/admin/audit' },
];

export default function Sidebar({ currentPath = '/goals/create' }: SidebarProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Guest';
  const userRole = (session?.user?.role || 'employee') as 'employee' | 'manager' | 'admin';
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => currentPath === href;

  const renderLinks = (items: { label: string; icon: string; href: string }[]) =>
    items.map((item) => (
      <a
        key={item.href}
        href={item.href}
        className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
      >
        <span className="material-symbols-outlined">{item.icon}</span>
        <span>{item.label}</span>
      </a>
    ));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '18px' }}>
            target
          </span>
        </div>
        <span className="text-headline-sm text-gradient">GoalAlign</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="text-label-sm text-on-surface-variant uppercase px-4 pt-4 pb-2">Main</p>
        {renderLinks(navItems)}

        {(userRole === 'manager' || userRole === 'admin') && (
          <>
            <p className="text-label-sm text-on-surface-variant uppercase px-4 pt-6 pb-2">Manager</p>
            {renderLinks(managerItems)}
          </>
        )}

        {userRole === 'admin' && (
          <>
            <p className="text-label-sm text-on-surface-variant uppercase px-4 pt-6 pb-2">Admin</p>
            {renderLinks(adminItems)}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-semibold text-sm">
            {userName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-md font-medium text-on-surface truncate">{userName}</p>
            <p className="text-body-sm text-on-surface-variant capitalize">{userRole}</p>
          </div>
          <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-panel border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-headline-sm text-gradient">GoalAlign</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-semibold text-xs">
            {userName.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 glass-panel animate-slide-in">
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 glass-panel border-r border-outline-variant z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
