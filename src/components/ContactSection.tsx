import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';

interface ContactSectionProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  lang,
  onHoverItem,
  onLeaveItem,
  hideHeader = false,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const email = 'Eliot.Hantute@gmail.com';
  const phone = '+33 7 75 03 68 75';
  const phoneTel = '+33775036875';

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  return (
    <div
      id={hideHeader ? undefined : 'contact'}
      className={`relative z-10 w-full ${hideHeader ? 'py-4' : 'mx-auto max-w-7xl px-4 py-16 sm:px-8'}`}
    >
      <div className="rounded-2xl md:rounded-3xl border border-black/[0.08] bg-white p-8 sm:p-12 lg:p-16">
        {/* Neiden Tag */}
        <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 border-b border-black/[0.08] pb-4 mb-8">
          <span className="font-bold text-black">
            [ 05 ‒ {lang === 'fr' ? 'COLLABORATION' : 'GET IN TOUCH'} ]
          </span>
          <span>PARIS, FR</span>
        </div>

        {/* Big Editorial Headline */}
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-black leading-tight">
          <InteractiveText
            text={lang === 'fr' ? 'Parlons de votre projet.' : 'Let’s talk.'}
            hoverColor="#000000"
          />
        </h2>

        <p className="mt-4 max-w-xl text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
          {lang === 'fr'
            ? 'Disponible pour des missions freelance, du développement front-end React, du Web 3D et du design d’interfaces.'
            : 'Available for freelance missions, React front-end development, Web 3D and UI design.'}
        </p>

        {/* Contact Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {/* Email button with copy action */}
          <button
            type="button"
            onClick={handleCopyEmail}
            onMouseEnter={() => onHoverItem?.('COPIER EMAIL')}
            onMouseLeave={onLeaveItem}
            className="neiden-btn-primary !px-6 !py-3 !text-sm"
          >
            <span>✉️</span>
            <span>{copiedEmail ? (lang === 'fr' ? 'Email copié ✓' : 'Email copied ✓') : email}</span>
            <span className="text-zinc-400 ml-1">{copiedEmail ? '✓' : '↗'}</span>
          </button>

          {/* Direct Phone */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${phoneTel}`}
              onMouseEnter={() => onHoverItem?.('APPELER')}
              onMouseLeave={onLeaveItem}
              className="neiden-btn-secondary !px-5 !py-3 !text-sm"
            >
              <span>📞</span>
              <span>{phone}</span>
            </a>

            <button
              type="button"
              onClick={handleCopyPhone}
              onMouseEnter={() => onHoverItem?.('COPIER NUMÉRO')}
              onMouseLeave={onLeaveItem}
              title="Copier le numéro"
              aria-label="Copier le numéro"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.12] bg-white text-black hover:border-black transition-all cursor-pointer"
            >
              <span className="font-mono text-xs">{copiedPhone ? '✓' : '📋'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Metadata & Socials */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.08] pt-6 font-mono text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/in/eliot-hantute/"
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => onHoverItem?.('LINKEDIN')}
              onMouseLeave={onLeaveItem}
              className="text-black hover:underline"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://github.com/eliothantute"
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => onHoverItem?.('GITHUB')}
              onMouseLeave={onLeaveItem}
              className="text-black hover:underline"
            >
              GitHub ↗
            </a>
            <a
              href="/cv-3d.html"
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => onHoverItem?.('CV 3D')}
              onMouseLeave={onLeaveItem}
              className="text-blue-600 hover:underline font-semibold"
            >
              CV 3D ↗
            </a>
          </div>

          <div>
            <span>© 2026 Eliot Hantute • Paris, France</span>
          </div>
        </div>
      </div>
    </div>
  );
};
