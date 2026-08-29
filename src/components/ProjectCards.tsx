import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Project, Language } from '../types';
import { InteractiveText } from './InteractiveText';

interface ProjectCardsProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const card3DVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: 14,
    scale: 0.94,
  },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      delay: idx * 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

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
        className="mb-14 flex flex-col items-start justify-between gap-4 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end"
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
        <p className="max-w-md text-sm text-zinc-500 sm:text-right">
          {lang === 'fr'
            ? 'Applications React, intégrations 3D et projets assistés par IA conçus avec précision.'
            : 'React apps, 3D experiences and AI-augmented projects built with precision.'}
        </p>
      </motion.div>

      {/* Projects Grid with 3D Perspective Stagger */}
      <div className="grid gap-8 md:grid-cols-2 [perspective:1200px]">
        {projects.map((project, idx) => (
          <motion.article
            key={`${project.id}-${idx}`}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={card3DVariants}
            onClick={() => onSelectProject(project)}
            onMouseEnter={() =>
              onHoverItem?.(lang === 'fr' ? 'VOIR LE PROJET' : 'VIEW PROJECT')
            }
            onMouseLeave={onLeaveItem}
            className="sneaks-card group flex cursor-pointer flex-col justify-between rounded-3xl p-5 sm:p-6 [transform-style:preserve-3d]"
          >
            {/* Project Image Container */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-100">
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Top Category Badge */}
              <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-800 shadow-sm backdrop-blur-md">
                  {project.category}
                </span>
              </div>

              {/* Status Pill on bottom hover */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="font-mono text-xs font-medium">{project.status}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-950 font-bold shadow-md transition-transform group-hover:scale-110">
                  ↗
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="mt-5 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-zinc-950 transition-colors group-hover:text-blue-600">
                    {project.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                    {project.subtitle}
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-zinc-400">
                  {project.year}
                </span>
              </div>

              {/* Tech Stack Pills */}
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-3.5">
                {project.stack.slice(0, 4).map((tech, sIdx) => (
                  <span
                    key={sIdx}
                    className="rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-700 transition-colors group-hover:bg-zinc-200/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
