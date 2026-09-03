import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';

interface ContactSectionProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const email = 'Eliot.Hantute@gmail.com';
  const phone = '+33 7 75 03 68 75';
  const phoneTel = '+33775036875';

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);

    setTimeout(() => {
      setCopiedEmail(false);
    }, 2500);
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);

    setTimeout(() => {
      setCopiedPhone(false);
    }, 2500);
  };

  return (
    <section
      id="contact"
      className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-8 lg:px-12 [perspective:1200px]"
      aria-label={lang === 'fr' ? 'Contactez-moi' : 'Contact me'}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: 12, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="sneaks-card mx-auto max-w-4xl rounded-[2.5rem] p-8 text-center sm:p-14 [transform-style:preserve-3d]"
      >
        <span className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Contact &amp; Collaboration
        </span>

        <h2 className="font-display text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
          <InteractiveText
            text={lang === 'fr' ? 'Construisons ensemble votre projet.' : 'Let’s build something great together.'}
            hoverColor="#0066ff"
          />
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
          {lang === 'fr'
            ? 'Disponible pour des missions freelance, développement front-end React, intégration 3D et prototypage assisté par IA.'
            : 'Available for freelance missions, React front-end development, 3D craft and AI-assisted prototyping.'}
        </p>

        {/* Dual Direct Contact Actions: Email + Phone */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Email Button with 1-click Copy */}
          <button
            type="button"
            onClick={handleCopyEmail}
            onMouseEnter={() => onHoverItem?.('COPIER EMAIL')}
            onMouseLeave={onLeaveItem}
            className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-zinc-950 px-8 py-4 text-sm sm:text-base font-bold text-white shadow-lg transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>✉️</span>
            <span>{copiedEmail ? (lang === 'fr' ? 'Email copié ✓' : 'Email copied ✓') : email}</span>
            <span className="text-zinc-400 group-hover:text-white transition-colors">{copiedEmail ? '✓' : '↗'}</span>
          </button>

          {/* Phone Button: Direct Call + Copy */}
          <div className="flex w-full sm:w-auto items-center gap-2">
            <a
              href={`tel:${phoneTel}`}
              onMouseEnter={() => onHoverItem?.('APPELER')}
              onMouseLeave={onLeaveItem}
              className="flex flex-1 sm:flex-initial items-center justify-center gap-2.5 rounded-full border border-zinc-300 bg-white px-7 py-4 text-sm sm:text-base font-bold text-zinc-900 shadow-sm transition-all hover:border-zinc-900 hover:bg-zinc-50 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>📞</span>
              <span>{phone}</span>
              <span className="font-mono text-xs text-blue-600">
                {lang === 'fr' ? 'Appeler' : 'Call'}
              </span>
            </a>

            <button
              type="button"
              onClick={handleCopyPhone}
              onMouseEnter={() => onHoverItem?.('COPIER TEL')}
              onMouseLeave={onLeaveItem}
              title={lang === 'fr' ? 'Copier le numéro' : 'Copy phone number'}
              aria-label={lang === 'fr' ? 'Copier le numéro' : 'Copy phone number'}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm transition-all hover:border-zinc-900 hover:bg-zinc-950 hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="font-mono text-xs">{copiedPhone ? '✓' : '📋'}</span>
            </button>
          </div>
        </div>

        {copiedPhone && (
          <p className="mt-3 font-mono text-xs text-emerald-600 font-semibold animate-pulse">
            {lang === 'fr' ? 'Numéro de téléphone copié dans le presse-papier ✓' : 'Phone number copied to clipboard ✓'}
          </p>
        )}

        {/* Social Links */}
        <div className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-3">
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
              onMouseEnter={() => onHoverItem?.(soc.name.toUpperCase())}
              onMouseLeave={onLeaveItem}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700 transition-all hover:border-zinc-900 hover:bg-white hover:text-zinc-950"
            >
              {soc.name} ↗
            </a>
          ))}
        </div>

        <p className="mx-auto mt-14 font-mono text-xs text-zinc-400">
          © 2026 Eliot Hantute • Creative Developer &amp; AI-Augmented Front-End • Paris, France
        </p>
      </motion.div>
    </section>
  );
};
