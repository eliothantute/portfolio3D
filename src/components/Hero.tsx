import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';

interface HeroProps {
  lang: Language;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onOpenContact, onHoverItem, onLeaveItem }) => {
  return (
    <section
      id="top"
      className="relative flex min-h-[88vh] w-full items-center justify-start overflow-hidden px-4 pt-28 pb-16 sm:px-8 sm:pt-36 lg:px-12 xl:px-16"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Column: Original Hero Typography & Content */}
        <div className="flex w-full lg:w-[58%] flex-col items-start text-left">
          {/* Status Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/90 px-4 py-1.5 shadow-xs backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-xs font-medium text-zinc-700">
              {lang === 'fr' ? 'Disponible pour nouveaux projets' : 'Available for new projects'}
            </span>
          </motion.div>

          {/* Interactive 3D Hover Headline: Creative Front-End / Developer in Blue */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 max-w-2xl"
          >
            <h1 className="font-display flex flex-col text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl md:text-7xl lg:text-[5.25rem] xl:text-[5.75rem] leading-[1.04]">
              <span className="block text-zinc-950">
                <InteractiveText
                  text="Creative Front-End"
                  hoverColor="#0066ff"
                />
              </span>
              <span className="mt-1 block text-blue-600 sm:mt-2">
                <InteractiveText
                  text="Developer"
                  hoverColor="#0047b3"
                />
              </span>
            </h1>
          </motion.div>

          {/* Pitch Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl text-base sm:text-lg text-zinc-600 font-normal leading-relaxed"
          >
            {lang === 'fr'
              ? "J'aime concevoir des interfaces soignées, des sites vitrines et des landing pages captivantes, sublimés par des animations fluides et de la 3D interactive."
              : "I love crafting polished interfaces, showcase websites, and captivating landing pages enhanced by smooth animations and interactive 3D."}
          </motion.p>

          {/* Two Original Highlighted Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            {/* Me contacter black pill button */}
            <button
              type="button"
              onClick={() => {
                if (onOpenContact) {
                  onOpenContact();
                } else {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onMouseEnter={() => onHoverItem?.('ME CONTACTER')}
              onMouseLeave={onLeaveItem}
              className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-zinc-950 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-zinc-950/15 transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-zinc-950 ring-offset-2 ring-offset-[#fafafa]"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'fr' ? 'Me contacter' : 'Get in touch'}</span>
              <span className="text-zinc-400 group-hover:text-white transition-colors">↗</span>
            </button>

            {/* Explorer les projets white pill button */}
            <a
              href="#projects"
              onMouseEnter={() => onHoverItem?.('PROJETS')}
              onMouseLeave={onLeaveItem}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white/95 px-7 py-3.5 text-sm font-bold text-zinc-900 shadow-xs backdrop-blur-sm transition-all hover:border-zinc-900 hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Explorer les projets' : 'Explore projects'}</span>
              <span>↓</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column: Visual space reserved for the 3D animated sphere */}
        <div className="hidden lg:block lg:w-[42%] min-h-[480px] pointer-events-none" />
      </div>
    </section>
  );
};
