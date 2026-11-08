'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredOrg, getStoredUser, setStoredUser } from '@/lib/data-store';
import { Organization, SessionUser } from '@/lib/types';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setOrg(getStoredOrg());
  }, [pathname]);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: 'grid_view' },
    { label: 'Create Review QR', href: '/qr-studio', icon: 'add_circle' },
    { label: 'My QR Codes', href: '/my-qr-codes', icon: 'qr_code_2' },
    { label: 'Analytics', href: '/analytics', icon: 'insights' },
    { label: 'Settings', href: '/settings', icon: 'settings' },
  ];

  const handleLogout = () => {
    setStoredUser(null);
    router.push('/login');
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
          <Link
            href="/qr/dining-t1-12"
            target="_blank"
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-200"
          >
            Preview Mobile
          </Link>
          <div className="w-8 h-8 rounded-full bg-[#005BBF] text-white flex items-center justify-center font-bold text-xs">
            {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'RP'}
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
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-[#004493] text-[10px] uppercase font-bold tracking-wider">
                SaaS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex flex-col">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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

        {/* Pro Plan Card at Bottom of Sidebar */}
        <div className="p-4 m-3 rounded-2xl bg-[#EFF4FF] border border-[#DCE9FF] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#005BBF]">Pro Plan</span>
            <span className="text-[10px] uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">
              Active
            </span>
          </div>
          <div className="font-semibold text-sm text-[#0B1C30] truncate">
            {org?.name || 'Royal Palace Hotel'}
          </div>
          <div className="text-xs text-[#565E74] truncate">
            {org?.category || 'Restaurant'} • {org?.city || 'Bettiah, Bihar'}
          </div>
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
          {/* Left: Search Input */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[19px]">
                search
              </span>
              <input
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#0B1C30] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] transition-all"
                placeholder="Search QR codes, stands, or analytics..."
                type="text"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* View Switcher: Business Dashboard vs Customer Mobile */}
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
              <Link
                href="/qr/dining-t1-12"
                target="_blank"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <span>Customer Mobile</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </Link>
            </div>

            {/* Notification Bell */}
            <button
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            </button>

            {/* Documentation / Help */}
            <Link
              href="https://github.com"
              target="_blank"
              aria-label="Help Documentation"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[22px]">help_outline</span>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#005BBF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'RP'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#0B1C30] leading-tight truncate max-w-[130px]">
                    {user?.displayName || 'Rajesh Kumar'}
                  </span>
                  <span className="text-[11px] text-[#565E74] leading-tight">
                    {user?.role === 'admin' ? 'Manager / Admin' : 'Staff'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">
                  arrow_drop_down
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
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
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>Log Out</span>
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

