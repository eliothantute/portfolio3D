import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';
import { ArrowDownRight, Compass } from 'lucide-react';
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
      {/* Grand Cadre Hero Blanc Épuré */}
      <div className="relative mx-auto w-full max-w-[1440px] min-h-[85vh] sm:min-h-[88vh] lg:min-h-[92vh] rounded-[2.5rem] sm:rounded-[3.2rem] lg:rounded-[3.8rem] bg-white text-zinc-950 border border-zinc-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col justify-center">
        {/* Scène 3D WebGL : Modèle 3D en noir sur fond blanc */}
        <YinYangVortex />

        {/* Dégradé doux blanc pour assurer une lisibilité parfaite des textes noirs */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/95 via-white/70 to-transparent lg:w-[58%] z-[5]" />

        {/* Contenu avant-plan : Typographie noire & Boutons */}
        <div className="relative z-10 flex w-full max-w-2xl flex-col items-start text-left p-6 sm:p-10 lg:p-16 pointer-events-none">
          {/* Badge Pillule Rôle avec Heure de Paris */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 inline-flex flex-wrap items-center gap-2.5 rounded-full border border-zinc-200 bg-zinc-100/90 px-4 py-1.5 shadow-xs backdrop-blur-xl pointer-events-auto"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950">
              ELIOT HANTUTE // PARIS {parisTime ? `• ${parisTime}` : ''}
            </span>
            <span className="h-3 w-px bg-zinc-300 hidden sm:inline" />
            <span className="font-mono text-[10.5px] font-medium text-zinc-600 hidden sm:inline">
              {lang === 'fr' ? 'Disponible pour projets' : 'Available for projects'}
            </span>
          </motion.div>

          {/* Titre Principal (Typo Noire) */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 max-w-2xl pointer-events-auto"
          >
            <h1 className="font-urbanist flex flex-col text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl md:text-6xl lg:text-[4.6rem] xl:text-[5.2rem] leading-[1.02]">
              <span className="block text-zinc-950">
                <InteractiveText
                  text="Creative Front-End"
                  hoverColor="#2563eb"
                />
              </span>
              <span className="mt-1 block text-zinc-900 sm:mt-2">
                <InteractiveText
                  text="Developer"
                  hoverColor="#4f46e5"
                />
              </span>
            </h1>
          </motion.div>

          {/* Description Sous-Titre */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl text-base sm:text-lg text-zinc-600 font-normal leading-relaxed pointer-events-auto"
          >
            {lang === 'fr'
              ? "Entre design et développement, conception d'interfaces et expériences web fluides et modernes."
              : "Between design and development: crafting fluid, modern interfaces and web experiences."}
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3.5 pointer-events-auto"
          >
            {/* Bouton Principal Noir */}
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
              className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-zinc-950 px-8 py-4 text-sm font-urbanist font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Démarrer un projet' : 'Start a project'}</span>
              <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>


            {/* Bouton Explorer les Projets */}
            <a
              href="#projects"
              onMouseEnter={() => onHoverItem?.('PROJETS')}
              onMouseLeave={onLeaveItem}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-900 px-6 py-4 font-urbanist text-sm font-medium text-zinc-700 hover:text-zinc-950 backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-xs"
            >
              <Compass className="h-4 w-4 text-zinc-600" />
              <span>{lang === 'fr' ? 'Explorer les Projets' : 'Explore Projects'}</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
