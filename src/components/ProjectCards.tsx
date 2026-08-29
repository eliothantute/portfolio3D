import React from 'react';
import { motion } from 'framer-motion';
import { Project, Language } from '../types';
import { InteractiveText } from './InteractiveText';
import { VelocityCarousel } from './VelocityCarousel';

interface ProjectCardsProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const ProjectCards: React.FC<ProjectCardsProps> = ({
  projects,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  return (
    <section
      id="projects"
      className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-8 lg:px-12"
      aria-label={lang === 'fr' ? 'Projets sélectionnés' : 'Featured projects'}
    >
      {/* Section Header with 3D Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 flex flex-col items-start justify-between gap-4 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end"
      >
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            {lang === 'fr' ? 'Projets Récents // 2026' : 'Selected Work // 2026'}
          </span>
          <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
            <InteractiveText
              text={lang === 'fr' ? 'Réalisations & Prototypes' : 'Featured Projects'}
              hoverColor="#0066ff"
            />
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-zinc-500 sm:text-right">
          {lang === 'fr'
            ? 'Applications React, intégrations 3D et projets assistés par IA conçus avec précision.'
            : 'React apps, 3D experiences and AI-augmented projects built with precision.'}
        </p>
      </motion.div>

      {/* Spacious Animated Framer Velocity Carousel */}
      <VelocityCarousel
        projects={projects}
        lang={lang}
        onSelectProject={onSelectProject}
        onHoverItem={onHoverItem}
        onLeaveItem={onLeaveItem}
      />
    </section>
  );
};
