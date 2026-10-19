import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { FractalAudioHero } from './FractalAudioHero';
import { ScrambleText } from './ScrambleText';

interface HeroProps {
  lang: Language;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const Hero: React.FC<HeroProps> = ({ lang, analyserRef, onHoverItem, onLeaveItem }) => {
  const [isTaglineHovered, setIsTaglineHovered] = useState(false);

  return (
    <section id="top" className="relative w-full overflow-hidden px-3 sm:px-6 lg:px-10 pt-28 sm:pt-32 pb-10">
      {/* Texture pointillée, façon fond "agence" */}
      <div className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[70vh]" />

      <div className="relative mx-auto w-full max-w-[1440px]" style={{ containerType: 'inline-size' }}>
        {/* Panneau visuel : le cube fractal audio-réactif */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          onMouseEnter={() => onHoverItem?.('ELIOT LAB // 3D')}
          onMouseLeave={onLeaveItem}
          className="relative z-10 h-[52vh] min-h-[340px] w-full overflow-hidden rounded-[2.5rem] bg-zinc-950 shadow-[0_30px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:h-[58vh] sm:rounded-[3rem] lg:h-[62vh] lg:rounded-[3.5rem]"
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

        {/* Eyebrow, collé juste au-dessus de la signature, aligné à gauche comme Mondragon */}
        <div className="relative z-10 mt-8 px-1 text-left sm:mt-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-space-mono text-sm font-normal uppercase tracking-[-0.01em] text-zinc-500 dark:text-zinc-400 sm:text-base"
          >
            <ScrambleText text={lang === 'fr' ? 'Développeur Front-End Créatif' : 'Creative Front-End Developer'} />
          </motion.span>
        </div>

        {/* Signature géante, prend toute la largeur, alignée à gauche */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="relative z-10 -ml-1 mt-1 select-none whitespace-nowrap text-left font-space-mono font-bold uppercase leading-none text-zinc-950 dark:text-white"
          style={{ fontSize: '18.5cqw', letterSpacing: '-0.02em' }}
        >
          Eliot Lab
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onMouseEnter={() => setIsTaglineHovered(true)}
          onMouseLeave={() => setIsTaglineHovered(false)}
          className="relative z-10 mt-5 max-w-md cursor-help text-left text-sm leading-snug text-zinc-600 dark:text-zinc-400 sm:text-base"
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
      </div>
    </section>
  );
};
