import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { profileData } from '../data/projects';
import { InteractiveText } from './InteractiveText';

interface HeroProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  const profile = profileData[lang];

  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-36 text-center sm:px-8 lg:pt-44"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        {/* Status Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md"
        >
          <span className="status-dot-emerald">
            <span />
            <span />
          </span>
          <span className="font-mono text-xs font-medium text-zinc-700">
            {lang === 'fr' ? 'Disponible pour nouveaux projets' : 'Available for new projects'}
          </span>
        </motion.div>

        {/* Interactive 3D Hover Headline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-4xl"
        >
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-zinc-950 sm:text-7xl lg:text-8xl leading-[1.05]">
            <InteractiveText
              text="Creative Front-End"
              hoverColor="#0066ff"
            />
          </h1>
        </motion.div>

        {/* Clear Pitch Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg"
        >
          {profile.heroPitch}
        </motion.p>

        {/* Clean Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3.5"
        >
          <a
            href="#projects"
            onMouseEnter={() => onHoverItem?.('PROJETS')}
            onMouseLeave={onLeaveItem}
            className="sneaks-btn-primary"
          >
            <span>{lang === 'fr' ? 'Explorer les projets' : 'Explore Projects'}</span>
            <span>↓</span>
          </a>

          <a
            href="#cv"
            onMouseEnter={() => onHoverItem?.('CV 3D')}
            onMouseLeave={onLeaveItem}
            className="sneaks-btn-secondary"
          >
            <span>{lang === 'fr' ? 'Télécharger mon CV' : 'Download Resume'}</span>
            <span>↗</span>
          </a>
        </motion.div>

        {/* Subtle Scroll Down Prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16"
        >
          <a
            href="#projects"
            aria-label="Scroll down"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-zinc-950 transition-colors"
          >
            <span>{lang === 'fr' ? 'Entrer dans les projets' : 'Enter projects'}</span>
            <span className="animate-bounce">↓</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
