'use client';

import { useState, type FormEvent } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const business = String(form.get('business') ?? '').trim();
    const message = String(form.get('message') ?? '').trim();
    if (!name || !business || !message) {
      setStatus('Please complete each field before continuing.');
      return;
    }

    const subject = encodeURIComponent(`Revvly enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nBusiness & city: ${business}\n\n${message}`);
    window.location.href = `mailto:vksarraf143@gmail.com?subject=${subject}&body=${body}`;
    setStatus('Your email app should open with a draft. Review it and send it from your email account.');
  }

  return (
    <form className="space-y-4 rounded-2xl border border-outline/50 bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-on-surface" htmlFor="contact-name">Your name</label>
        <input className="w-full rounded-xl border border-outline/50 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" id="contact-name" name="name" placeholder="e.g. Rohit Sharma" required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-on-surface" htmlFor="contact-business">Business name &amp; city</label>
        <input className="w-full rounded-xl border border-outline/50 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" id="contact-business" name="business" placeholder="e.g. Royal Palace Hotel, Bettiah" required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-on-surface" htmlFor="contact-message">Your message</label>
        <textarea className="min-h-32 w-full resize-y rounded-xl border border-outline/50 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" id="contact-message" name="message" placeholder="Tell us about your venue and what you need..." required />
      </div>
      <button className="w-full rounded-full bg-primary px-5 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" type="submit">
        Send via Email <span aria-hidden="true">→</span>
      </button>
      <p aria-live="polite" className="text-center text-xs leading-5 text-secondary">{status || 'This opens an email draft on your device; it does not send or store your message.'}</p>
    </form>
  );
}
