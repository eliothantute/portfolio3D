import React, { useState } from 'react';
import { Language } from '../types';

interface ContactSectionProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  const [copied, setCopied] = useState(false);

  const email = 'Eliot.Hantute@gmail.com';

  const handleCopyEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setCopied(true);

    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'absolute rounded-full pointer-events-none z-50 bg-[#a8b8e8] animate-ping';
    ripple.style.left = `${e.clientX - rect.left - 20}px`;
    ripple.style.top = `${e.clientY - rect.top - 20}px`;
    ripple.style.width = '40px';
    ripple.style.height = '40px';
    btn.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
      setCopied(false);
    }, 2500);
  };

  return (
    <section id="contact" className="relative z-10 overflow-hidden border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_42%,#ffffff_100%)] px-6 py-32 sm:px-16">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-[min(75vw,900px)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(145,171,255,0.2)_0%,rgba(145,171,255,0)_70%)] blur-2xl" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <span className="mb-5 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
          <span className="h-px w-8 bg-slate-300" />
          Contact
          <span className="h-px w-8 bg-slate-300" />
        </span>

        <h2 className="font-display text-5xl font-black tracking-tight text-slate-900 sm:text-7xl">
          {lang === 'fr' ? 'Construisons une interface qui marque.' : 'Let us build an interface that leaves a mark.'}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {lang === 'fr'
            ? "Direction UI, motion et développement front-end pour des expériences digitales premium."
            : 'UI direction, motion and front-end craft for premium digital experiences.'}
        </p>

        <div className="mt-12">
          <button
            onClick={handleCopyEmail}
            onMouseEnter={() => onHoverItem?.('COPY')}
            onMouseLeave={onLeaveItem}
            className="lux-interactive inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.18em] text-slate-700 shadow-[0_12px_34px_rgba(23,33,59,0.08)] hover:border-slate-800 hover:bg-slate-900 hover:text-white"
          >
            <span>{copied ? (lang === 'fr' ? 'Email copié' : 'Email copied') : email}</span>
            <span>↗</span>
          </button>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { name: 'GitHub', url: 'https://github.com/eliothantute' },
            { name: 'Instagram', url: 'https://www.instagram.com/zedenmusic' },
            { name: 'Spotify', url: 'https://open.spotify.com/intl-fr/artist/77sTx1uwPp7N9KlNPPGH49' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/' },
          ].map((soc) => (
            <a
              key={soc.name}
              href={soc.url}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => onHoverItem?.('LINK')}
              onMouseLeave={onLeaveItem}
              className="lux-interactive rounded-full border border-slate-300 bg-white px-4 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-600 hover:border-slate-800 hover:text-slate-900"
            >
              {soc.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
