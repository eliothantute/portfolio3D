import React, { useEffect, useState } from 'react';
import { Language } from '../types';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  isMuted: boolean;
  toggleAudio: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  isMuted,
  toggleAudio,
  onHoverItem,
  onLeaveItem,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-5 z-50 flex justify-center px-4 transition-all duration-300 ${
        scrolled ? 'translate-y-0' : 'translate-y-1'
      }`}
    >
      <div
        className={`flex w-full max-w-4xl items-center justify-between border border-zinc-200/90 bg-white/85 px-4 py-2.5 backdrop-blur-xl transition-all sm:px-6 sm:py-3 rounded-full ${
          scrolled ? 'shadow-md border-zinc-300' : 'shadow-sm'
        }`}
      >
        {/* Brand Logo */}
        <a
          href="#top"
          onMouseEnter={() => onHoverItem?.('ACCUEIL')}
          onMouseLeave={onLeaveItem}
          className="flex items-center gap-2 font-display text-sm font-extrabold tracking-tight text-zinc-950 transition-opacity hover:opacity-75 sm:text-base"
        >
          <span className="flex h-2 w-2 rounded-full bg-zinc-950" />
          Eliot Lab
        </a>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-7 font-sans text-xs font-semibold text-zinc-600 md:flex">
          <a
            href="#projects"
            onMouseEnter={() => onHoverItem?.('PROJETS')}
            onMouseLeave={onLeaveItem}
            className="transition-colors hover:text-zinc-950"
          >
            {lang === 'fr' ? 'Projets' : 'Work'}
          </a>

          <a
            href="#about"
            onMouseEnter={() => onHoverItem?.('PROFIL')}
            onMouseLeave={onLeaveItem}
            className="transition-colors hover:text-zinc-950"
          >
            {lang === 'fr' ? 'Profil' : 'About'}
          </a>

          <a
            href="/cv-3d.html"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => onHoverItem?.('CV 3D // NOUVELLE FENÊTRE')}
            onMouseLeave={onLeaveItem}
            className="transition-colors hover:text-blue-600 font-bold"
          >
            {lang === 'fr' ? 'CV 3D ↗' : '3D CV ↗'}
          </a>

          <a
            href="#contact"
            onMouseEnter={() => onHoverItem?.('CONTACT')}
            onMouseLeave={onLeaveItem}
            className="transition-colors hover:text-zinc-950"
          >
            Contact
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            onMouseEnter={() => onHoverItem?.('AUDIO')}
            onMouseLeave={onLeaveItem}
            className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
            aria-label="Toggle Audio"
          >
            {isMuted ? 'Audio Off' : 'Audio On'}
          </button>

          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            onMouseEnter={() => onHoverItem?.('LANG')}
            onMouseLeave={onLeaveItem}
            className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-3 font-mono text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
          >
            {lang.toUpperCase()}
          </button>

          <a
            href="#contact"
            onMouseEnter={() => onHoverItem?.('CONTACT')}
            onMouseLeave={onLeaveItem}
            className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-950 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800"
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
};
