import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { profileData } from '../data/projects';
import { InteractiveText } from './InteractiveText';

interface HeroProps {
  lang: Language;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onOpenContact, onHoverItem, onLeaveItem }) => {
  const profile = profileData[lang];

  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-36 text-center sm:px-8 lg:pt-44"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        {/* Soft Radial Contrast Shield against 3D particles - subtle to let the impressive 3D sphere shine */}
        <div className="pointer-events-none absolute -inset-x-12 -inset-y-16 z-0 rounded-full bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,rgba(250,250,250,0.38)_0%,rgba(250,250,250,0)_100%)] backdrop-blur-[0.2px]" />

        {/* Status Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mb-8 inline-flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md"
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
          className="relative z-10 mb-6 max-w-5xl"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 rounded-full bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,102,255,0.08)_0%,rgba(0,102,255,0)_100%)] blur-2xl" />

          <h1 className="font-display flex flex-col items-center justify-center text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl md:text-7xl lg:text-8xl leading-[1.06]">
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

        {/* Clear Pitch Subtext (H2) */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-2xl text-base font-normal leading-relaxed text-zinc-600 sm:text-lg md:text-xl"
        >
          {profile.heroPitch}
        </motion.h2>

        {/* Two Highlighted Action Buttons: Explorer les projets & Me contacter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {/* Highlighted Contact Button */}
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
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-zinc-950 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-zinc-950/20 transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-zinc-950 ring-offset-2 ring-offset-[#fafafa]"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{lang === 'fr' ? 'Me contacter' : 'Get in touch'}</span>
            <span className="text-zinc-400 group-hover:text-white transition-colors">↗</span>
          </button>

          {/* Explore Projects Button */}
          <a
            href="#projects"
            onMouseEnter={() => onHoverItem?.('PROJETS')}
            onMouseLeave={onLeaveItem}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white/95 px-7 py-3.5 text-sm font-bold text-zinc-900 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-900 hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{lang === 'fr' ? 'Explorer les projets' : 'Explore Projects'}</span>
            <span>↓</span>
          </a>
        </motion.div>

        {/* Services Quick-Pills Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2"
        >
          {[
            { label: lang === 'fr' ? 'Site Vitrine' : 'Showcase Website', icon: '🌐' },
            { label: lang === 'fr' ? 'Landing Page' : 'Landing Page', icon: '🚀' },
            { label: lang === 'fr' ? 'Site E-Commerce' : 'E-Commerce Store', icon: '🛍️' },
            { label: lang === 'fr' ? 'Application' : 'Application', icon: '📱' },
            { label: lang === 'fr' ? 'Animation & 3D' : '3D & Animations', icon: '🪄' },
            { label: lang === 'fr' ? 'Logo' : 'Logo & Branding', icon: '🎨' },
          ].map((item) => (
            <a
              key={item.label}
              href="#services"
              onMouseEnter={() => onHoverItem?.(item.label.toUpperCase())}
              onMouseLeave={onLeaveItem}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/90 px-3.5 py-1.5 font-mono text-[11px] font-medium text-zinc-700 shadow-2xs backdrop-blur-sm transition-all hover:border-zinc-400 hover:bg-white hover:text-zinc-950 hover:scale-105"
            >
              <span className="text-xs">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
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
