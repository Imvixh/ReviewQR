'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCodeLib from 'qrcode';

export interface QRPosterFrameProps {
  businessName?: string;
  category?: string;
  locality?: string;
  accentColor?: string;
  headline?: string;
  tagline?: string;
  destinationUrl?: string;
  emblemText?: string;
  logoUrl?: string;
  preset?: 'google-classic' | 'minimal-white' | 'royal-gold' | 'modern-navy' | 'bistro-green' | 'dark-luxury' | string;
  geometry?: 'classic' | 'rounded' | 'dots' | 'premium-eye';
  centerEmblem?: 'google-g' | 'business-logo';
  className?: string;
  onDownloadPng?: () => void;
}

export const QRPosterFrame: React.FC<QRPosterFrameProps> = ({
  businessName = 'Your business',
  category = '',
  locality = '',
  accentColor = '#1A73E8',
  headline = 'Review us on Google',
  tagline = 'Scan to share your experience',
  destinationUrl = '',
  logoUrl,
  preset = 'google-classic',
  geometry = 'rounded',
  centerEmblem = 'google-g',
  className = '',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      if (!destinationUrl) {
        setQrDataUrl('');
        return;
      }

      try {
        const dataUrl = await QRCodeLib.toDataURL(destinationUrl, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 320,
          color: {
            dark: '#0B1C30',
            light: '#FFFFFF',
          },
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQR();
    return () => {
      isMounted = false;
    };
  }, [destinationUrl]);

  // Color & Theme derivation based on preset
  const isDark = preset === 'modern-navy' || preset === 'dark-luxury';
  const isGold = preset === 'royal-gold';
  const isGreen = preset === 'bistro-green';

  const cardBgClass =
    preset === 'modern-navy'
      ? 'bg-[#0F172A] text-white border-slate-800'
      : preset === 'dark-luxury'
      ? 'bg-[#18181B] text-white border-zinc-800'
      : isGold
      ? 'bg-[#FFFDF5] text-[#78350F] border-amber-200'
      : isGreen
      ? 'bg-[#F0FDF4] text-[#064E3B] border-emerald-200'
      : 'bg-white text-[#0B1C30] border-slate-100';

  const textPrimaryClass = isDark ? 'text-white' : isGold ? 'text-[#78350F]' : isGreen ? 'text-[#064E3B]' : 'text-[#0B1C30]';
  const textSecondaryClass = isDark ? 'text-slate-400' : isGold ? 'text-[#B45309]' : isGreen ? 'text-[#047857]' : 'text-[#565E74]';

  return (
    <div
      ref={posterRef}
      className={`relative w-full max-w-[340px] rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center transition-all duration-300 border overflow-hidden ${cardBgClass} ${className}`}
      style={{
        boxShadow: '0 20px 35px -10px rgba(15,23,42,0.15), 0 1px 3px rgba(15,23,42,0.08)',
      }}
    >
      {/* Top Google Strip for google-classic */}
      {preset === 'google-classic' && (
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]"></div>
      )}

      {/* Decorative accent wave */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#1A73E8]/10 rounded-full blur-xl pointer-events-none"></div>

      {/* Top Badge: "SHARE YOUR EXPERIENCE" */}
      <div className="mb-3 z-10">
        <span
          className="px-3 py-0.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase shadow-xs"
          style={{ backgroundColor: isDark ? '#334155' : '#0F172A' }}
        >
          Share Your Experience
        </span>
      </div>

      {/* Mini Brand Crest & Business Info */}
      <div className="flex flex-col items-center gap-1 mb-3 z-10">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-1 overflow-hidden shadow-sm">
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#0F172A] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">hotel</span>
            </div>
          )}
        </div>
        <h3 className={`font-extrabold text-base tracking-tight leading-snug uppercase ${textPrimaryClass}`}>
          {businessName}
        </h3>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondaryClass}`}>
          {[category, locality].filter(Boolean).join(' · ') || 'Business details not set'}
        </p>
      </div>

      {/* Central QR Code Frame */}
      <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-100 mb-3.5 flex items-center justify-center z-10">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR code for ${businessName}`}
            className={`w-44 h-44 object-contain ${
              geometry === 'rounded' ? 'rounded-xl' : geometry === 'dots' ? 'rounded-2xl' : 'rounded-none'
            }`}
          />
        ) : (
          <div className="w-44 h-44 bg-slate-50 flex items-center justify-center px-4 text-center text-xs text-[#565E74]">
            Choose a saved review destination to generate this QR code.
          </div>
        )}

        {/* Center Emblem: Google G vs Business Logo */}
        <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center pointer-events-none overflow-hidden">
          {centerEmblem === 'business-logo' && logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : centerEmblem === 'business-logo' ? (
            <span className="material-symbols-outlined text-amber-600 text-lg">crown</span>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Headline Callout */}
      <div className="flex flex-col items-center gap-1 z-10 w-full mb-3">
        <p className={`font-bold text-sm tracking-tight ${textPrimaryClass}`}>{headline}</p>
      </div>

      {/* Call-to-Action Footer Banner */}
      <div
        className="w-full py-2 px-3 rounded-lg text-white flex items-center justify-center gap-1.5 z-10 shadow-sm"
        style={{ backgroundColor: accentColor }}
      >
        <span className="material-symbols-outlined text-[15px]">photo_camera</span>
        <span className="text-xs font-semibold">{tagline}</span>
      </div>
    </div>
  );
};
