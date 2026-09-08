import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface AboutSectionProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

const SKILL_PILLARS = [
  {
    num: '01',
    title: { fr: 'Développement Front-End', en: 'Front-End Engineering' },
    tag: { fr: 'CODE & PERFORMANCE', en: 'CODE & PERFORMANCE' },
    desc: {
      fr: 'Création d’interfaces rapides, interactives et responsives avec les meilleures technologies modernes.',
      en: 'Fast, interactive, and responsive web interfaces built with cutting-edge tech.',
    },
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Vite', 'HTML5 / CSS3'],
  },
  {
    num: '02',
    title: { fr: 'Web 3D & Animations', en: 'Web 3D & Motion' },
    tag: { fr: 'IMMERSION & EXPÉRIENCE', en: 'IMMERSION & CRAFT' },
    desc: {
      fr: 'Intégration d’objets 3D et de micro-animations pour rendre la navigation mémorable.',
      en: '3D scene integration and fluid micro-animations creating memorable impressions.',
    },
    skills: ['Three.js', 'React Three Fiber', 'Shaders (GLSL)', 'GSAP', 'Framer Motion'],
  },
  {
    num: '03',
    title: { fr: 'Design UI & Prototypage', en: 'UI Design & Prototyping' },
    tag: { fr: 'ESTHÉTIQUE & ERGONOMIE', en: 'AESTHETICS & UX' },
    desc: {
      fr: 'Conception de maquettes soignées, chartes graphiques et design systems cohérents.',
      en: 'Polished layouts, cohesive design systems, and intuitive user experiences.',
    },
    skills: ['Figma', 'Design Systems', 'Wireframing', 'Direction Artistique', 'UI Kits'],
  },
  {
    num: '04',
    title: { fr: 'IA & Méthodologie', en: 'AI & Smart Workflows' },
    tag: { fr: 'RAPIDITÉ & QUALITÉ', en: 'VELOCITY & AGILITY' },
    desc: {
      fr: 'Utilisation d’outils d’intelligence artificielle pour accélérer le prototypage et la livraison.',
      en: 'AI-assisted coding and automated workflows to accelerate prototyping and shipping.',
    },
    skills: ['Antigravity / Cursor', 'Workflows LLM', 'Git / GitHub', 'Déploiement Vercel'],
  },
];

export const AboutSection: React.FC<AboutSectionProps> = ({
  lang,
  onHoverItem,
  onLeaveItem,
  hideHeader = false,
}) => {
  return (
    <div className="w-full">
      {/* 4 Clean Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {SKILL_PILLARS.map((pillar) => (
          <motion.div
            key={pillar.num}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onMouseEnter={() => onHoverItem?.(pillar.title[lang].toUpperCase())}
            onMouseLeave={onLeaveItem}
            className="rounded-2xl md:rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-8 transition-all duration-300 hover:border-black/25 hover:shadow-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <span className="font-bold text-black">[ {pillar.num} ]</span>
              <span className="uppercase tracking-wider">{pillar.tag[lang]}</span>
            </div>

            {/* Title & Description */}
            <h3 className="font-display mt-4 text-xl sm:text-2xl font-bold tracking-tight text-black">
              {pillar.title[lang]}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              {pillar.desc[lang]}
            </p>

            {/* Skills Pills */}
            <div className="mt-5 flex flex-wrap gap-1.5 border-t border-black/[0.06] pt-4 font-mono text-xs">
              {pillar.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded border border-black/[0.08] bg-zinc-50 px-2.5 py-1 text-zinc-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
