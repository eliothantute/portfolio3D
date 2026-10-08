import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { Language, Theme } from '../types';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  isMuted: boolean;
  toggleAudio: () => void;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  theme,
  toggleTheme,
  isMuted,
  toggleAudio,
  onOpenContact,
  onHoverItem,
  onLeaveItem,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('top');
  const [scrollProgress, setScrollProgress] = useState(0);

  const sectionIds = ['top', 'modes', 'projects', 'cv', 'diorama', 'contact'];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      let current = 'top';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) {
          current = id;
        }
      }
      setActiveSection(current);

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const isExpanded = !scrolled || isHovered;

  const navItems = [
    { id: 'modes', label: lang === 'fr' ? 'Prestations' : 'Services' },
    { id: 'projects', label: lang === 'fr' ? 'Projets' : 'Work' },
    { id: 'cv', label: lang === 'fr' ? 'CV 3D' : '3D CV' },
  ];

  return (
    <>
      {/* Barre de progression de lecture, liée au scroll global */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"
          style={{ width: `${scrollProgress * 100}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      <header
        className={`fixed left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? 'top-3' : 'top-5'
        }`}
      >
      <motion.div
        layout
        onMouseEnter={() => {
          setIsHovered(true);
          if (scrolled) onHoverItem?.('MENU // ELIOT LAB');
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onLeaveItem?.();
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className={`pointer-events-auto flex items-center border backdrop-blur-2xl rounded-full transition-colors duration-300 shadow-xl ${
          isExpanded
            ? 'w-full max-w-4xl justify-between px-3 py-2 sm:px-6 sm:py-3 border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 shadow-md'
            : 'w-auto justify-center px-4 py-2 sm:px-5 sm:py-2.5 border-zinc-300/90 dark:border-zinc-700 bg-white/95 dark:bg-zinc-950/95 shadow-2xl hover:scale-105 cursor-pointer'
        }`}
      >
        {/* Brand Logo: Eliot Lab */}
        <a
          href="#top"
          onClick={(e) => {
            if (!isExpanded) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onMouseEnter={() => onHoverItem?.('ACCUEIL // TOP')}
          onMouseLeave={onLeaveItem}
          className="flex items-center gap-1.5 sm:gap-2 font-display font-extrabold tracking-tight text-zinc-950 dark:text-white transition-opacity hover:opacity-80 text-xs sm:text-base shrink-0"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Eliot Lab</span>
        </a>

        {/* Expandable Navigation & Actions */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="nav-expanded-content"
              initial={{ opacity: 0, scale: 0.95, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.95, width: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between gap-2 sm:gap-6 overflow-hidden pl-2 sm:pl-6 flex-1 min-w-0"
            >
              {/* Center Navigation Links */}
              <nav className="hidden items-center gap-1 font-sans text-xs font-semibold text-zinc-500 dark:text-zinc-400 md:flex">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onMouseEnter={() => onHoverItem?.(item.label.toUpperCase())}
                      onMouseLeave={onLeaveItem}
                      className={`relative px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                        isActive ? 'text-zinc-950 dark:text-white font-bold' : 'hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-zinc-100 dark:bg-zinc-800"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              {/* Action Controls: Audio + Lang + Contact */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Audio toggle button */}
                <button
                  type="button"
                  onClick={toggleAudio}
                  onMouseEnter={() => onHoverItem?.(isMuted ? 'ACTIVER SON' : 'COUPER SON')}
                  onMouseLeave={onLeaveItem}
                  className="hidden sm:inline-flex h-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 font-mono text-xs text-zinc-600 hover:text-zinc-950 hover:bg-white transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                  title={isMuted ? 'Activer le son' : 'Couper le son'}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>

                {/* Lang toggle pill */}
                <button
                  type="button"
                  onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                  onMouseEnter={() => onHoverItem?.('LANG')}
                  onMouseLeave={onLeaveItem}
                  className="inline-flex h-7 sm:h-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 sm:px-3 font-mono text-[11px] sm:text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-950 cursor-pointer dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {lang.toUpperCase()}
                </button>

                {/* Day / Night Theme toggle button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  onMouseEnter={() =>
                    onHoverItem?.(
                      theme === 'dark'
                        ? lang === 'fr'
                          ? 'MODE JOUR'
                          : 'LIGHT MODE'
                        : lang === 'fr'
                        ? 'MODE NUIT'
                        : 'DARK MODE'
                    )
                  }
                  onMouseLeave={onLeaveItem}
                  className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[11px] sm:text-xs transition-all hover:border-zinc-300 hover:bg-white hover:scale-110 active:scale-95 cursor-pointer dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  title={
                    theme === 'dark'
                      ? lang === 'fr'
                        ? 'Passer en mode jour (Clair)'
                        : 'Switch to light mode'
                      : lang === 'fr'
                      ? 'Passer en mode nuit (Sombre)'
                      : 'Switch to dark mode'
                  }
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </button>

                {/* Contact CTA pill */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenContact) {
                      onOpenContact();
                    } else {
                      const el = document.getElementById('contact');
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  onMouseEnter={() => onHoverItem?.('CONTACT')}
                  onMouseLeave={onLeaveItem}
                  className="inline-flex h-7 sm:h-8 items-center justify-center rounded-full bg-zinc-950 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Contact
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </header>
    </>
  );
};
