import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { FractalAudioHero } from './FractalAudioHero';

interface HeroProps {
  lang: Language;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, analyserRef, onHoverItem, onLeaveItem }) => {
  const [parisTime, setParisTime] = useState('');
  const [isTaglineHovered, setIsTaglineHovered] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setParisTime(
        now.toLocaleTimeString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="top" className="relative w-full px-3 sm:px-6 lg:px-10 pt-24 sm:pt-28 pb-10">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Ligne d'intro compacte : statut + courte signature, pas de gros titre */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 sm:mb-6 flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between sm:gap-10"
        >
          <div className="inline-flex shrink-0 items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Eliot Hantute // Paris {parisTime ? `• ${parisTime}` : ''}
            </span>
          </div>

          <p
            onMouseEnter={() => setIsTaglineHovered(true)}
            onMouseLeave={() => setIsTaglineHovered(false)}
            className="max-w-md cursor-help text-sm leading-snug text-zinc-700 dark:text-zinc-300 sm:text-right sm:text-base md:text-lg"
          >
            <AnimatePresence mode="wait">
              {isTaglineHovered ? (
                <motion.span
                  key="translated"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {lang === 'fr'
                    ? 'Creative Front-End Developer — expériences web 3D immersives.'
                    : 'Creative Front-End Developer — immersive 3D web experiences.'}
                </motion.span>
              ) : (
                <motion.span
                  key="japanese"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block font-mono tracking-wide"
                >
                  デザインと開発のはざまで、没入感のある3D体験を創造する。
                </motion.span>
              )}
            </AnimatePresence>
          </p>
        </motion.div>

        {/* Grand panneau visuel : le cube fractal audio-réactif occupe presque tout l'écran */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          onMouseEnter={() => onHoverItem?.('ELIOT LAB // 3D')}
          onMouseLeave={onLeaveItem}
          className="relative h-[72vh] min-h-[460px] w-full overflow-hidden rounded-[2.5rem] bg-zinc-950 shadow-[0_30px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:h-[80vh] sm:rounded-[3rem] lg:h-[85vh] lg:rounded-[3.5rem]"
        >
          <FractalAudioHero analyserRef={analyserRef} />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-5 text-white/50 sm:px-10 sm:pb-7">
            <span className="font-mono text-sm sm:text-base">+</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] sm:text-xs">
              {lang === 'fr' ? 'Défiler pour explorer' : 'Scroll to explore'}
            </span>
            <span className="font-mono text-sm sm:text-base">+</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
