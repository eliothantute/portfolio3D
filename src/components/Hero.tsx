import React from 'react';
import { Language } from '../types';

interface HeroProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  return (
    <section
      id="top"
      className="pointer-events-none relative flex min-h-screen w-full items-center justify-center overflow-hidden z-10"
      aria-label={lang === 'fr' ? 'Scène 3D principale' : 'Main 3D scene'}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_58%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.45em] text-slate-500/80 sm:text-[11px]">
          Eliot Lab
        </p>
        <h1 className="max-w-5xl font-display text-4xl uppercase tracking-[0.18em] text-slate-900 sm:text-6xl lg:text-8xl">
          <span className="block">UI DESIGNER</span>
          <span className="block text-slate-500">FRONT END</span>
          <span className="block">DEVELOPPER</span>
        </h1>
      </div>
    </section>
  );
};
