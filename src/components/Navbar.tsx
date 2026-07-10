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
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-5 z-50 px-4 transition-all duration-500 sm:px-8 ${
        scrolled ? 'translate-y-0' : 'translate-y-1'
      }`}
    >
      <div
        className={`mx-auto w-full max-w-7xl border border-slate-200/80 bg-white/72 px-4 py-3 backdrop-blur-xl transition-all sm:px-6 sm:py-4 ${
          scrolled
            ? 'rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.12)]'
            : 'rounded-[1.35rem] shadow-[0_14px_34px_rgba(15,23,42,0.08)]'
        }`}
      >
        <div className="relative flex items-center justify-between gap-4">
          <a
            href="#top"
            onMouseEnter={() => onHoverItem?.('TOP')}
            onMouseLeave={onLeaveItem}
            className="lux-interactive group inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.16em] text-slate-900 sm:text-[0.9rem]"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-900" />
            Eliot Hantute
          </a>

          <nav className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 lg:flex">
            <a
              href="#projects"
              onMouseEnter={() => onHoverItem?.('WORK')}
              onMouseLeave={onLeaveItem}
              className="lux-interactive border-b border-transparent py-1 hover:border-slate-700 hover:text-slate-900"
            >
              {lang === 'fr' ? 'Projets' : 'Work'}
            </a>

            <a
              href="#globe"
              onMouseEnter={() => onHoverItem?.('ATELIER')}
              onMouseLeave={onLeaveItem}
              className="lux-interactive border-b border-transparent py-1 hover:border-slate-700 hover:text-slate-900"
            >
              Atelier
            </a>

            <a
              href="#about"
              onMouseEnter={() => onHoverItem?.('ABOUT')}
              onMouseLeave={onLeaveItem}
              className="lux-interactive border-b border-transparent py-1 hover:border-slate-700 hover:text-slate-900"
            >
              {lang === 'fr' ? 'Profil' : 'About'}
            </a>

            <a
              href="#contact"
              onMouseEnter={() => onHoverItem?.('LINK')}
              onMouseLeave={onLeaveItem}
              className="lux-interactive border-b border-transparent py-1 text-slate-700 hover:border-slate-700 hover:text-slate-900"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleAudio}
              onMouseEnter={() => onHoverItem?.('AUDIO')}
              onMouseLeave={onLeaveItem}
              className="lux-interactive inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-xs text-slate-600 hover:border-slate-700 hover:text-slate-900 sm:px-4"
              aria-label="Toggle Audio"
            >
              {isMuted ? 'Audio Off' : 'Audio On'}
            </button>

            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              onMouseEnter={() => onHoverItem?.('LANG')}
              onMouseLeave={onLeaveItem}
              className="lux-interactive inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-700 hover:border-slate-700 hover:text-slate-900 sm:px-4"
            >
              {lang.toUpperCase()}
            </button>

            <a
              href="#contact"
              onMouseEnter={() => onHoverItem?.('CONTACT')}
              onMouseLeave={onLeaveItem}
              className="lux-interactive inline-flex h-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white hover:bg-slate-700"
            >
              {lang === 'fr' ? 'Parler' : 'Start'}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
