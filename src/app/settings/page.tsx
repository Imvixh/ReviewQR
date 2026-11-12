'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getStoredOrg, getStoredUser, setStoredOrg, setStoredUser } from '@/lib/data-store';
import { Organization, SessionUser } from '@/lib/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Business Profile & Branding Fields (Unified from business-profile page)
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [accentColor, setAccentColor] = useState('#1A73E8');
  const [tagline, setTagline] = useState('');

  // Asset states
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getStoredUser();
    const o = getStoredOrg();
    setUser(u);
    setOrg(o);
    if (u?.displayName) setFullName(u.displayName);
    if (u?.email) setEmail(u.email);

    if (o.name) setBusinessName(o.name);
    if (o.category) setCategory(o.category);
    if (o.city) setCity(o.city);
    if (o.phone) setBusinessPhone(o.phone);
    if (o.email) setBusinessEmail(o.email);
    if (o.address) setBusinessAddress(o.address);
    if (o.accentColor) setAccentColor(o.accentColor);
    if (o.tagline) setTagline(o.tagline);
    if (o.logoUrl) setLogoUrl(o.logoUrl);
    if (o.thumbnailUrl) setThumbnailUrl(o.thumbnailUrl);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('No authenticated profile is available to update.');
      return;
    }
    setStoredUser({ ...user, displayName: fullName, email });
    showToast('Profile changes are only stored in this browser; server profile updates are unavailable.');
  };

  const handleSaveBusinessProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = setStoredOrg({
      name: businessName,
      category,
      city,
      phone: businessPhone,
      email: businessEmail,
      address: businessAddress,
      accentColor,
      tagline,
      logoUrl,
      thumbnailUrl,
    });
    setOrg(updated);
    showToast('Business changes are only stored in this browser; server profile updates are unavailable.');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showToast('Upload a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5 MB limit.');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');
      if (!org?.id) {
        throw new Error('Save your business review destination before uploading a logo.');
      }
      formData.append('orgId', org.id);

      const res = await fetch('/api/business/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.message || data.code || 'Business logo upload failed.');
      }
      setLogoUrl(data.url);
      setStoredOrg({ logoUrl: data.url, logoPath: data.path });
      showToast('Business logo uploaded.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Business logo upload failed.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    showToast('Logo removal is unavailable. No stored logo was changed.');
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showToast('Upload a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5 MB limit.');
      return;
    }

    setIsUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'thumbnail');
      if (!org?.id) {
        throw new Error('Save your business review destination before uploading a cover image.');
      }
      formData.append('orgId', org.id);

      const res = await fetch('/api/business/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.message || data.code || 'Cover image upload failed.');
      }
      setThumbnailUrl(data.url);
      setStoredOrg({ thumbnailUrl: data.url, thumbnailPath: data.path });
      showToast('Cover thumbnail uploaded.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Cover image upload failed.');
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleRemoveThumbnail = () => {
    showToast('Cover image removal is unavailable. No stored image was changed.');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please fill out both current and new password fields.');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.');
      return;
    }
    if (!isSupabaseConfigured || !user?.email) {
      showToast('Password update is unavailable without an authenticated Supabase account.');
      return;
    }
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (verifyError) throw verifyError;
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setCurrentPassword('');
      setNewPassword('');
      showToast('Password updated.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Password update failed.');
    }
  };

  return (
    <DashboardShell>
      {/* Hidden file inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleLogoUpload}
      />
      <input
        ref={thumbInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleThumbnailUpload}
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0B1C30] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
            <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#1A73E8] tracking-wider">
              <span>Settings &amp; Preferences</span>
              <span className="text-slate-300">•</span>
              <span className="text-green-700">Cloud Sync Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] tracking-tight">
              Settings &amp; Account Management
            </h1>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs">
            <span className="font-bold text-[#1A73E8]">PRO PLAN ACTIVE</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">4 / 10 QRs Deployed</span>
          </div>
        </div>

        {/* Settings Grid: Left Subnav / Right Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Subnav Panel (3 cols) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1 sticky top-24">
            <a href="#business" className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#1A73E8] bg-blue-50">
              Business &amp; Branding
            </a>
            <a href="#profile" className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50">
              Account Profile
            </a>
            <a href="#defaults" className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50">
              QR Stand Defaults
            </a>
            <a href="#notifications" className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50">
              Notifications
            </a>
            <a href="#security" className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50">
              Security &amp; Password
            </a>
            <a href="#danger" className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50">
              Danger Zone
            </a>
          </div>

          {/* Content (9 cols) */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {/* 1. Business Profile & Branding Assets (Unified from standalone page) */}
            <section id="business" className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">storefront</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B1C30]">Business Profile &amp; Branding Assets</h3>
                    <p className="text-xs text-[#565E74]">Manage venue details, business logo, and cover thumbnail</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                  Place not verified
                </span>
              </div>

              {/* Branding Asset Uploaders: Logo & Thumbnail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* A. Business Logo Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B1C30]">Business Logo Mark</span>
                    <span className="text-[10px] text-slate-500 font-medium">Posters &amp; Stands</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center p-2 overflow-hidden shrink-0">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-3xl">image</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <span className="text-xs text-slate-600 truncate">
                        {logoUrl ? 'Active logo applied' : 'No custom logo uploaded'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isUploadingLogo}
                          onClick={() => logoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-[#1A73E8] border border-slate-200 shadow-2xs transition-all"
                        >
                          {isUploadingLogo ? 'Uploading...' : logoUrl ? 'Replace Logo' : 'Upload Logo'}
                        </button>
                        {logoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">PNG, JPG, or WebP up to 5MB</span>
                </div>

                {/* B. Cover Thumbnail Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B1C30]">Venue Cover Thumbnail</span>
                    <span className="text-[10px] text-slate-500 font-medium">Customer Mobile Header</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-3xl">landscape</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <span className="text-xs text-slate-600 truncate">
                        {thumbnailUrl ? 'Cover image active' : 'Default cover photo'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isUploadingThumb}
                          onClick={() => thumbInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-[#1A73E8] border border-slate-200 shadow-2xs transition-all"
                        >
                          {isUploadingThumb ? 'Uploading...' : thumbnailUrl ? 'Replace Cover' : 'Upload Cover'}
                        </button>
                        {thumbnailUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveThumbnail}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB (16:9 recommended)</span>
                </div>
              </div>

              {/* Business Details Form */}
              <form onSubmit={handleSaveBusinessProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Business Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City / Branch Location</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-700">Review destination</p>
                      <p className="mt-1 text-xs leading-5 text-[#565E74]">
                        Find, confirm, and save the review destination in the unified QR editor.
                      </p>
                      <Link
                        href="/qr-studio?mode=create"
                        className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[#EFF4FF] px-3 py-2 text-xs font-bold text-[#005BBF] hover:bg-[#DCE9FF]"
                      >
                        Manage review destination
                      </Link>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Venue Address</label>
                    <input
                      type="text"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                  >
                    Save Business Details &amp; Branding
                  </button>
                </div>
              </form>
            </section>

            {/* 2. Account Profile */}
            <section id="profile" className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B1C30]">Account Profile</h3>
                    <p className="text-xs text-[#565E74]">Personal credentials and communication preferences</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Direct Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">Language:</span>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        language === 'en' ? 'bg-[#1A73E8] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('hi')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        language === 'hi' ? 'bg-[#1A73E8] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      हिन्दी
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold text-xs shadow-md transition-all"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </section>

            {/* 3. Business & QR Defaults */}
            <section id="defaults" className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">tune</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B1C30]">QR Export Capabilities</h3>
                    <p className="text-xs text-[#565E74]">Export preferences are not configurable yet.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
                QR Studio currently downloads PNG artwork and opens the browser print dialog. Resolution,
                PDF output, crop marks, bleed, and export preference persistence are not verified.
              </div>
            </section>

            {/* 4. Notifications */}
            <section id="notifications" className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">notifications</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B1C30]">Notification Preferences</h3>
                    <p className="text-xs text-[#565E74]">Email notifications are not configured.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
                ReviewQR does not currently send scan reports, milestone alerts, or product-update emails.
              </div>
            </section>

            {/* 5. Security & Password */}
            <section id="security" className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B1C30]">Security &amp; Sessions</h3>
                    <p className="text-xs text-[#565E74]">Password updates are available for configured Supabase accounts; session management is unavailable.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1C30] font-semibold text-xs transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </section>

            {/* 6. Danger Zone */}
            <section id="danger" className="bg-red-50/50 p-6 sm:p-8 rounded-2xl border border-red-200 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-700">
                <span className="material-symbols-outlined text-2xl">dangerous</span>
                <div>
                  <h3 className="font-bold text-sm text-red-900">Danger Zone</h3>
                  <p className="text-xs text-red-700">Account and data deletion controls are not implemented.</p>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-[#0B1C30]">Account and data deletion</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    No account, QR, analytics, or asset data will be changed from this page.
                  </div>
                </div>
                <span className="shrink-0 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600">
                  Unavailable
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
