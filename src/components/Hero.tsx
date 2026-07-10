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
      className="pointer-events-none relative min-h-screen w-full z-10"
      aria-label={lang === 'fr' ? 'Scène 3D principale' : 'Main 3D scene'}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_58%)]" />
    </section>
  );
};
