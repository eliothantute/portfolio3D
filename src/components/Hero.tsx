import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';
import { Sparkles, Clock, ArrowDownRight, Compass } from 'lucide-react';
import { YinYangVortex } from './YinYangVortex';

interface HeroProps {
  lang: Language;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onOpenContact, onHoverItem, onLeaveItem }) => {
  const [parisTime, setParisTime] = useState('');

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
    <section
      id="top"
      className="relative w-full px-3 sm:px-6 lg:px-10 pt-24 sm:pt-28 pb-10"
    >
      {/* Giant Frame Container encompassing the entire Hero */}
      <div className="relative mx-auto w-full max-w-[1440px] min-h-[85vh] sm:min-h-[88vh] lg:min-h-[92vh] rounded-[2.5rem] sm:rounded-[3.2rem] lg:rounded-[3.8rem] bg-black text-white border border-zinc-800/90 shadow-[0_30px_90px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-center">
        {/* Full-Frame 3D WebGL Scene: Zero column bounds, 100% unified with the hero space */}
        <YinYangVortex />

        {/* Soft atmospheric gradient protecting text legibility while letting particles flow through */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/95 via-black/50 to-transparent lg:w-[58%] z-[5]" />

        {/* Foreground Content: Typography & Action Buttons positioned with depth over the 3D space */}
        <div className="relative z-10 flex w-full max-w-2xl flex-col items-start text-left p-6 sm:p-10 lg:p-16 pointer-events-none">
          {/* Role Pill Badge with Live Paris Time */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 inline-flex flex-wrap items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 shadow-md backdrop-blur-xl pointer-events-auto"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              ELIOT HANTUTE // PARIS {parisTime ? `• ${parisTime}` : ''}
            </span>
            <span className="h-3 w-px bg-white/20 hidden sm:inline" />
            <span className="font-mono text-[10.5px] font-medium text-zinc-300 hidden sm:inline">
              {lang === 'fr' ? 'Disponible pour projets' : 'Available for projects'}
            </span>
          </motion.div>

          {/* Interactive Headline */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 max-w-2xl pointer-events-auto"
          >
            <h1 className="font-urbanist flex flex-col text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.6rem] xl:text-[5.2rem] leading-[1.02]">
              <span className="block text-white">
                <InteractiveText
                  text="Creative Front-End"
                  hoverColor="#60a5fa"
                />
              </span>
              <span className="mt-1 block text-zinc-200 sm:mt-2">
                <InteractiveText
                  text="Developer"
                  hoverColor="#a78bfa"
                />
              </span>
            </h1>
          </motion.div>

          {/* Subtext Description */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl text-base sm:text-lg text-zinc-300 font-normal leading-relaxed pointer-events-auto"
          >
            {lang === 'fr'
              ? "Entre design et développement, conception d'interfaces et expériences web fluides et modernes."
              : "Between design and development: crafting fluid, modern interfaces and web experiences."}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3.5 pointer-events-auto"
          >
            {/* Primary White Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (onOpenContact) {
                  onOpenContact();
                }
              }}
              onMouseEnter={() => onHoverItem?.('DISCUTER D’UN PROJET')}
              onMouseLeave={onLeaveItem}
              className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-urbanist font-bold text-zinc-950 shadow-lg transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Démarrer un projet' : 'Start a project'}</span>
              <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>

            {/* Collaboration Modes Anchor Button */}
            <a
              href="#collaboration"
              onMouseEnter={() => onHoverItem?.('LES 3 MODES')}
              onMouseLeave={onLeaveItem}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-4 font-urbanist text-sm font-bold text-white shadow-xs backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? '3 Modes de collaboration' : '3 Collaboration Modes'}</span>
              <span className="text-zinc-400 group-hover:text-white">↓</span>
            </a>

            {/* Secondary Projects Button */}
            <a
              href="#projects"
              onMouseEnter={() => onHoverItem?.('PROJETS')}
              onMouseLeave={onLeaveItem}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-black/40 px-6 py-4 font-urbanist text-sm font-medium text-zinc-300 backdrop-blur-md transition-all hover:text-white hover:border-white/30 hover:scale-105 cursor-pointer"
            >
              <Compass className="h-4 w-4 text-zinc-300" />
              <span>{lang === 'fr' ? 'Explorer les Projets' : 'Explore Projects'}</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
