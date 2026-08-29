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
  const [copied, setCopied] = useState(false);

  const email = 'Eliot.Hantute@gmail.com';

  const handleCopyEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
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

        {/* 1-Click Email Copy Button */}
        <div className="mt-9">
          <button
            onClick={handleCopyEmail}
            onMouseEnter={() => onHoverItem?.('COPIER EMAIL')}
            onMouseLeave={onLeaveItem}
            className="sneaks-btn-primary px-8 py-4 text-base"
          >
            <span>{copied ? (lang === 'fr' ? 'Email copié dans le presse-papier ✓' : 'Email copied to clipboard ✓') : email}</span>
            <span>{copied ? '✓' : '↗'}</span>
          </button>
        </div>

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
