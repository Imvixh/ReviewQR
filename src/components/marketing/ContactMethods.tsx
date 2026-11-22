'use client';

import { useState } from 'react';

export default function ContactMethods() {
  const [emailOpen, setEmailOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="rounded-2xl border border-outline/50 bg-white p-6 shadow-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">mail</span>
        <h2 className="mt-3 font-display text-lg font-bold text-on-surface">Email us</h2>
        <button
          aria-controls="contact-email-value"
          aria-expanded={emailOpen}
          className="mt-2 rounded-md font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setEmailOpen((open) => !open)}
          type="button"
        >
          {emailOpen ? 'Hide email' : 'Show email'}
        </button>
        {emailOpen && (
          <a className="mt-2 block break-all font-semibold text-primary hover:underline" href="mailto:vksarraf143@gmail.com" id="contact-email-value">
            vksarraf143@gmail.com
          </a>
        )}
        <p className="mt-2 text-sm leading-6 text-secondary">Best for setup help, pricing and partnerships.</p>
      </section>

      <section className="rounded-2xl border border-outline/50 bg-white p-6 shadow-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">call</span>
        <h2 className="mt-3 font-display text-lg font-bold text-on-surface">Call / WhatsApp</h2>
        <button
          aria-controls="contact-phone-value"
          aria-expanded={phoneOpen}
          className="mt-2 rounded-md font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setPhoneOpen((open) => !open)}
          type="button"
        >
          {phoneOpen ? 'Hide phone number' : 'Show phone number'}
        </button>
        {phoneOpen && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <a className="font-semibold text-primary hover:underline" href="tel:+919102629506" id="contact-phone-value">+91 91026 29506</a>
            <a className="font-semibold text-primary hover:underline" href="https://wa.me/919102629506" rel="noreferrer" target="_blank">WhatsApp</a>
          </div>
        )}
        <p className="mt-2 text-sm leading-6 text-secondary">For a quick walkthrough of how Revvly works.</p>
      </section>
    </div>
  );
}
