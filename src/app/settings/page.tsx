'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getStoredOrg, getStoredUser, setStoredOrg, setStoredUser } from '@/lib/data-store';
import { Organization, SessionUser } from '@/lib/types';

export default function SettingsPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState('Rajesh Kumar');
  const [roleTitle, setRoleTitle] = useState('General Manager');
  const [email, setEmail] = useState('rajesh.kumar@royalpalace.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Business Profile & Branding Fields (Unified from business-profile page)
  const [businessName, setBusinessName] = useState('Royal Palace Hotel');
  const [category, setCategory] = useState('Restaurant & Lounge');
  const [city, setCity] = useState('Bettiah, Bihar');
  const [businessPhone, setBusinessPhone] = useState('+91 98765 43210');
  const [businessEmail, setBusinessEmail] = useState('manager@royalpalacehotel.in');
  const [businessAddress, setBusinessAddress] = useState('Station Road, Near Super Market, Bettiah, Bihar - 845438');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://g.page/r/Cbll2345abc992eEBM/review');
  const [accentColor, setAccentColor] = useState('#1A73E8');
  const [tagline, setTagline] = useState('Your honest feedback helps our culinary staff serve you better.');

  // Asset states
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  // Defaults
  const [defaultFormat, setDefaultFormat] = useState('png');
  const [show5StarDefault, setShow5StarDefault] = useState(true);
  const [includeBleedDefault, setIncludeBleedDefault] = useState(true);

  // Notifications toggles
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [instantSurgeAlerts, setInstantSurgeAlerts] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationPhrase, setDeleteConfirmationPhrase] = useState('');

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
    if (o.googleReviewUrl) setGoogleReviewUrl(o.googleReviewUrl);
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
    setStoredUser({
      ...user!,
      displayName: fullName,
      email,
    });
    showToast('Account profile successfully updated!');
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
      googleReviewUrl,
      accentColor,
      tagline,
      logoUrl,
      thumbnailUrl,
    });
    setOrg(updated);
    showToast('Business details and branding assets saved!');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, SVG, WebP).');
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
      formData.append('orgId', org?.id || 'org_royal_palace');

      const res = await fetch('/api/business/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setLogoUrl(data.url);
        setStoredOrg({ logoUrl: data.url, logoPath: data.path });
        showToast('Business logo updated successfully!');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const val = reader.result as string;
          setLogoUrl(val);
          setStoredOrg({ logoUrl: val });
          showToast('Business logo updated!');
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const val = reader.result as string;
        setLogoUrl(val);
        setStoredOrg({ logoUrl: val });
        showToast('Business logo updated!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setStoredOrg({ logoUrl: '', logoPath: '' });
    showToast('Business logo removed.');
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WebP).');
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
      formData.append('orgId', org?.id || 'org_royal_palace');

      const res = await fetch('/api/business/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setThumbnailUrl(data.url);
        setStoredOrg({ thumbnailUrl: data.url, thumbnailPath: data.path });
        showToast('Cover thumbnail updated successfully!');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const val = reader.result as string;
          setThumbnailUrl(val);
          setStoredOrg({ thumbnailUrl: val });
          showToast('Cover thumbnail updated!');
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const val = reader.result as string;
        setThumbnailUrl(val);
        setStoredOrg({ thumbnailUrl: val });
        showToast('Cover thumbnail updated!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl('');
    setStoredOrg({ thumbnailUrl: '', thumbnailPath: '' });
    showToast('Cover thumbnail removed.');
  };

  const handleSaveDefaults = () => {
    showToast('Business & QR defaults saved!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please fill out both current and new password fields.');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    showToast('Password updated successfully!');
  };

  const handleExecutePurge = () => {
    if (deleteConfirmationPhrase !== (org?.name || 'Royal Palace Hotel')) {
      alert(`Confirmation phrase does not match "${org?.name || 'Royal Palace Hotel'}".`);
      return;
    }
    alert('Account and QR touchpoint data scheduled for purge.');
    setShowDeleteModal(false);
    window.location.href = '/';
  };

  return (
    <DashboardShell>
      {/* Hidden file inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
              <div className="flex items-center gap-3 text-red-600">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <h3 className="font-bold text-lg text-[#0B1C30]">Delete Account & Purge QRs</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This action is irreversible. All physical QR stands, analytics telemetry, and touchpoint associations will be permanently purged.
              </p>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800">
                To confirm, type <strong className="font-mono">{org?.name || 'Royal Palace Hotel'}</strong> below:
              </div>
              <input
                type="text"
                value={deleteConfirmationPhrase}
                onChange={(e) => setDeleteConfirmationPhrase(e.target.value)}
                placeholder="Type business name to confirm"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-red-500"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecutePurge}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
                >
                  Confirm Permanent Delete
                </button>
              </div>
            </div>
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
                  <span className="text-[11px] text-slate-400">PNG, JPG, SVG, WebP up to 5MB</span>
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
                    <label className="font-semibold text-slate-700 block mb-1">Official Google Review Destination URL</label>
                    <input
                      type="url"
                      value={googleReviewUrl}
                      onChange={(e) => setGoogleReviewUrl(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#1A73E8]"
                    />
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
                    <h3 className="font-bold text-sm text-[#0B1C30]">QR Stand Defaults</h3>
                    <p className="text-xs text-[#565E74]">Default settings applied when creating new physical stands</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Preferred Download Format</label>
                  <select
                    value={defaultFormat}
                    onChange={(e) => setDefaultFormat(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                  >
                    <option value="png">PNG RGB (Digital / Fast Print)</option>
                    <option value="pdf">Print-Ready PDF CMYK (Commercial 300 DPI)</option>
                    <option value="svg">Vector SVG (Unlimited Scalability)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="defStar"
                      type="checkbox"
                      checked={show5StarDefault}
                      onChange={(e) => setShow5StarDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1A73E8]"
                    />
                    <label htmlFor="defStar" className="font-medium text-slate-700 cursor-pointer">
                      Show Google 5-Star bar by default
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="defBleed"
                      type="checkbox"
                      checked={includeBleedDefault}
                      onChange={(e) => setIncludeBleedDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1A73E8]"
                    />
                    <label htmlFor="defBleed" className="font-medium text-slate-700 cursor-pointer">
                      Include commercial crop marks &amp; 3mm bleed
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveDefaults}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1C30] font-semibold text-xs transition-colors"
                >
                  Save Defaults
                </button>
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
                    <p className="text-xs text-[#565E74]">Email summaries and instant scan telemetry alerts</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  {
                    title: 'Weekly Scan & Performance Summary',
                    desc: 'A Monday morning digest summarizing scans, Google clicks, and conversion rates.',
                    val: weeklyDigest,
                    setter: setWeeklyDigest,
                  },
                  {
                    title: 'Milestone Scan Alerts',
                    desc: 'Celebration email when your stands reach 500, 1,000, and 5,000 customer scans.',
                    val: milestoneAlerts,
                    setter: setMilestoneAlerts,
                  },
                  {
                    title: 'Instant Scan Surge Alerts',
                    desc: 'Notify manager when more than 50 scans occur in a 1-hour rush window.',
                    val: instantSurgeAlerts,
                    setter: setInstantSurgeAlerts,
                  },
                  {
                    title: 'Product Updates & Google Policy Changes',
                    desc: 'Critical notices regarding Google Business Profile review policies and features.',
                    val: productUpdates,
                    setter: setProductUpdates,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-bold text-[#0B1C30]">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => item.setter(!item.val)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        item.val ? 'bg-[#1A73E8]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          item.val ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
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
                    <p className="text-xs text-[#565E74]">Password updates and active device session management</p>
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
                  <p className="text-xs text-red-700">Irreversible actions that affect your venue account and QR stands</p>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-[#0B1C30]">Purge Account &amp; All QR Telemetry</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Permanently delete all touchpoints, scanned review data, and venue assets.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
                >
                  Purge Data...
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
