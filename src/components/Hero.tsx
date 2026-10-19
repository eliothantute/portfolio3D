import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Language } from '../types';
import { FractalAudioHero } from './FractalAudioHero';
import { ScrambleText } from './ScrambleText';
import { Hourglass3D } from './Hourglass3D';
import { TextVideoMask } from './TextVideoMask';

interface HeroProps {
  lang: Language;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

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
    <section id="top" className="relative w-full overflow-hidden px-3 sm:px-6 lg:px-10 pt-28 sm:pt-32 pb-10">
      {/* Texture pointillée, façon fond "agence" */}
      <div className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[70vh]" />

      <div className="relative mx-auto w-full max-w-[1440px]">
        {/* Ligne du haut : eyebrow à gauche, cartes flottantes à droite */}
        <div className="relative z-10 flex flex-col gap-5 px-1 sm:flex-row sm:items-start sm:justify-between">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 sm:text-xs"
          >
            <ScrambleText text={lang === 'fr' ? 'Développeur Front-End Créatif' : 'Creative Front-End Developer'} />
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="hidden shrink-0 flex-col items-start gap-2.5 sm:flex sm:items-end"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80 sm:text-right">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                {lang === 'fr' ? 'Démarrer un projet' : 'Start a project'}
              </p>
              <p className="mt-1 font-urbanist text-sm font-bold leading-snug text-zinc-950 dark:text-white">
                {lang === 'fr' ? 'Discutons de votre idée.' : "Let's talk about your idea."}
              </p>
              <a
                href="#contact"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-950"
              >
                {lang === 'fr' ? 'Me contacter' : 'Get in touch'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-2 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                {lang === 'fr' ? 'Disponible' : 'Available'} // Paris {parisTime ? `• ${parisTime}` : ''}
              </span>
              <Hourglass3D />
            </div>
          </motion.div>
        </div>

        {/* Titre géant — le cube fractal 3D n'apparaît qu'à travers les lettres */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          className="relative z-10"
        >
          <TextVideoMask
            lines={['Eliot', 'Hantute']}
            textClassName="select-none font-urbanist font-black uppercase leading-[0.84] tracking-[-0.03em] text-zinc-950 dark:text-white"
            style={{ fontSize: 'clamp(3.4rem, 13vw, 9.5rem)' }}
          >
            <FractalAudioHero
              analyserRef={analyserRef}
              particleCount={6000}
              presetParams={{ size: 150, depth: 3.5, spin: 0.7, pulse: 0.45 }}
              backgroundColor={0x0b0a1f}
            />
          </TextVideoMask>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onMouseEnter={() => setIsTaglineHovered(true)}
          onMouseLeave={() => setIsTaglineHovered(false)}
          className="relative z-10 mt-5 max-w-md cursor-help text-sm leading-snug text-zinc-600 dark:text-zinc-400 sm:text-base"
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
                  ? 'Creative Front-End Developer — expériences web immersives.'
                  : 'Creative Front-End Developer — immersive web experiences.'}
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
                デザインと開発のはざまで、没入感のある体験を創造する。
              </motion.span>
            )}
          </AnimatePresence>
        </motion.p>

        {/* Panneau visuel : le cube fractal audio-réactif */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
          onMouseEnter={() => onHoverItem?.('ELIOT LAB // 3D')}
          onMouseLeave={onLeaveItem}
          className="relative z-10 mt-10 h-[60vh] min-h-[400px] w-full overflow-hidden rounded-[2.5rem] bg-zinc-950 shadow-[0_30px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:mt-14 sm:h-[70vh] sm:rounded-[3rem] lg:h-[75vh] lg:rounded-[3.5rem]"
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
