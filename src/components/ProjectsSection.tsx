import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Language, SkillType } from '../types';

interface ProjectsSectionProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

// Plain-language, jargon-free descriptions in French & English
const SIMPLE_DESCRIPTIONS: Record<string, { fr: string; en: string }> = {
  'atelier-berger': {
    fr: 'Globe 3D interactif pour explorer des projets d’exception à travers le monde.',
    en: 'Interactive 3D globe to explore luxury design projects worldwide.',
  },
  'elora': {
    fr: 'Site vitrine moderne conçu d’après une maquette Figma soignée.',
    en: 'Clean, modern showcase website built from a detailed Figma design.',
  },
  'nari-os': {
    fr: 'Site immersif présentant une solution d’intelligence artificielle vocale.',
    en: 'Immersive website showcasing a sovereign voice AI solution.',
  },
  'ping-paris': {
    fr: 'Carte interactive pour trouver facilement les tables de ping-pong gratuites à Paris.',
    en: 'Interactive city map to find free outdoor table tennis spots in Paris.',
  },
  'hazi-whatsapp': {
    fr: 'Page de présentation pour une application intelligente sur ordinateur.',
    en: 'Showcase landing page for a modern desktop AI application.',
  },
  'aum-paris': {
    fr: 'Boutique en ligne élégante et épurée pour une marque de maroquinerie de luxe.',
    en: 'Minimalist, luxury e-commerce shop for leather goods.',
  },
  'centre-neuro': {
    fr: 'Modernisation du site web du centre de santé pour une navigation plus claire.',
    en: 'Clean redesign of a medical center website for easier navigation.',
  },
  'souvenir-francais': {
    fr: 'Site institutionnel clair, accessible et adapté à tous les écrans.',
    en: 'Clear, accessible institutional website designed for all screens.',
  },
  'disfocus': {
    fr: 'Portfolio immersif pour un artiste 3D avec interactions visuelles dynamiques.',
    en: 'Immersive 3D artist portfolio with dynamic visual interactions.',
  },
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<SkillType>('all');

  const filterOptions: { id: SkillType; label: { fr: string; en: string } }[] = [
    { id: 'all', label: { fr: 'Tous les projets', en: 'All Projects' } },
    { id: 'frontend', label: { fr: 'Web 3D & Front', en: '3D Web & Front' } },
    { id: 'design', label: { fr: 'Design UI', en: 'UI Design' } },
    { id: 'app', label: { fr: 'Applications', en: 'Apps' } },
    { id: 'music', label: { fr: 'Musique', en: 'Music' } },
  ];

  const filteredProjects = useMemo(() => {
    if (selectedFilter === 'all') return projects;
    return projects.filter((p) => p.skillType === selectedFilter);
  }, [projects, selectedFilter]);

  return (
    <div className="w-full">
      {/* Category Filter Pills */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((opt) => {
            const count =
              opt.id === 'all'
                ? projects.length
                : projects.filter((p) => p.skillType === opt.id).length;
            const isActive = selectedFilter === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedFilter(opt.id)}
                onMouseEnter={() => onHoverItem?.(opt.label[lang].toUpperCase())}
                onMouseLeave={onLeaveItem}
                className={`rounded-full px-4 py-1.5 font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950'
                }`}
              >
                <span>{opt.label[lang]}</span>
                <span className="ml-1 opacity-50">({count})</span>
              </button>
            );
          })}
        </div>

        <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
          [ {filteredProjects.length} / {projects.length} {lang === 'fr' ? 'SÉLECTIONS' : 'ITEMS'} ]
        </span>
      </div>

      {/* Clean Clear Cards Grid (Cartes Claires) */}
      <motion.div layout className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:gap-8">
        <AnimatePresence>
          {filteredProjects.map((project, idx) => {
            const simpleDesc =
              SIMPLE_DESCRIPTIONS[project.id]?.[lang] || project.subtitle || project.description;
            const projectIndex = String(idx + 1).padStart(2, '0');

            return (
              <motion.article
                layout
                key={project.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-200/90 bg-white p-5 sm:p-7 shadow-xs transition-all duration-300 hover:border-zinc-400 hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Metadata Row: Index & Category Pill */}
                  <div className="mb-4 flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-zinc-950">
                      [ {projectIndex} ‒ {project.year} ]
                    </span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 font-semibold uppercase tracking-wider text-zinc-700">
                      {project.category}
                    </span>
                  </div>

                  {/* Clean Visual Media Preview */}
                  <div
                    onClick={() => onSelectProject(project)}
                    onMouseEnter={() => onHoverItem?.(project.title.toUpperCase())}
                    onMouseLeave={onLeaveItem}
                    className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 cursor-pointer"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />

                    {/* YouTube Indicator Badge */}
                    {project.youtubeId && (
                      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm">
                        <span>▶</span>
                        <span>YOUTUBE</span>
                      </div>
                    )}
                  </div>

                  {/* Card Title & Plain-Language Summary */}
                  <div className="mt-5">
                    <h3
                      onClick={() => onSelectProject(project)}
                      className="font-display text-2xl font-bold tracking-tight text-zinc-950 transition-colors hover:text-blue-600 cursor-pointer"
                    >
                      {project.title}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-600 leading-relaxed font-normal">
                      {simpleDesc}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px]">
                      {project.stack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-zinc-700 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-zinc-950 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <span>{lang === 'fr' ? 'Détails du projet' : 'Project details'}</span>
                    <span>→</span>
                  </button>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95"
                    >
                      <span>{lang === 'fr' ? 'Voir le site' : 'Visit site'}</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
