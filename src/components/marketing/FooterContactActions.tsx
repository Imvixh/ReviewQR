'use client';

import { useState } from 'react';

export default function FooterContactActions() {
  const [emailOpen, setEmailOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
      <div>
        <button
          aria-controls="footer-email-contact"
          aria-expanded={emailOpen}
          className="inline-flex items-center gap-2 rounded-md text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setEmailOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">mail</span>
          <span>{emailOpen ? 'Hide email' : 'Email'}</span>
        </button>
        {emailOpen && (
          <a className="mt-2 block break-all pl-7 font-medium text-primary hover:underline" href="mailto:vksarraf143@gmail.com" id="footer-email-contact">
            vksarraf143@gmail.com
          </a>
        )}
      </div>

      <div>
        <button
          aria-controls="footer-phone-contact"
          aria-expanded={phoneOpen}
          className="inline-flex items-center gap-2 rounded-md text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setPhoneOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">call</span>
          <span>{phoneOpen ? 'Hide phone' : 'Phone'}</span>
        </button>
        {phoneOpen && (
          <a className="mt-2 block pl-7 font-medium text-primary hover:underline" href="tel:+919102629506" id="footer-phone-contact">
            +91 91026 29506
          </a>
        )}
      </div>
    </div>
  );
}
