'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredUser, setStoredUser } from '@/lib/data-store';
import { SessionUser } from '@/lib/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: 'grid_view' },
    { label: 'Create Review QR', href: '/qr-studio?mode=create', icon: 'add_circle' },
    { label: 'My QR Codes', href: '/my-qr-codes', icon: 'qr_code_2' },
    { label: 'Analytics', href: '/analytics', icon: 'insights' },
    { label: 'Settings', href: '/settings', icon: 'settings' },
  ];

  const handleLogout = async () => {
    setLogoutError(null);
    setIsLoggingOut(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await createClient().auth.signOut();
        if (error) throw error;
      }

      setStoredUser(null);
      router.push('/login');
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Could not log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          <span className="font-bold text-lg tracking-tight">ReviewQR</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#005BBF] text-white flex items-center justify-center font-bold text-xs">
            {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'U'}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto transition-transform lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-[#1A73E8] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-xl">qr_code_2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-[#0B1C30] tracking-tight">
                Review<span className="text-[#1A73E8]">QR</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex flex-col">
            {navItems.map((item) => {
              const isActive = item.href.startsWith('/qr-studio')
                ? pathname === '/qr-studio' || pathname === '/create-qr'
                : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-[#1A73E8] text-white font-semibold shadow-sm'
                      : 'text-[#414754] hover:bg-slate-100 hover:text-[#0B1C30]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Workspace status */}
        <div className="p-4 m-3 rounded-2xl bg-[#EFF4FF] border border-[#DCE9FF] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#005BBF]">Workspace</span>
            <span className="text-[10px] uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              Prototype
            </span>
          </div>
          <div className="text-xs text-[#565E74]">QR designs are browser-local.</div>
          <div className="pt-2 border-t border-blue-200/50 flex items-center justify-between text-xs font-medium text-[#1A73E8]">
            <Link href="/settings" className="hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">tune</span> Manage
            </Link>
            <span className="text-slate-400">v0.1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Desktop Top Header */}
        <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6">
          <div className="flex flex-1 items-center">
            <span className="text-xs font-semibold text-slate-500">ReviewQR workspace</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Workspace navigation */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-white text-[#1A73E8] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Business Dashboard
              </Link>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#005BBF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#0B1C30] leading-tight truncate max-w-[130px]">
                    {user?.displayName || 'Account'}
                  </span>
                  <span className="text-[11px] text-[#565E74] leading-tight">
                    {user?.role || 'ReviewQR account'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">
                  arrow_drop_down
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  {logoutError && (
                    <p className="px-4 py-2 text-xs text-red-700" role="alert">
                      {logoutError}
                    </p>
                  )}
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#0B1C30]">{user?.displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    <span>Account Settings</span>
                  </Link>
                  <Link
                    href="/settings#business"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                    <span>Business Profile</span>
                  </Link>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>{isLoggingOut ? 'Logging out…' : 'Log Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Children Content */}
        <main className="flex-1 w-full bg-[#F8F9FF]">{children}</main>
      </div>
    </div>
  );
};
