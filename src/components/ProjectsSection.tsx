import React, { useState, useMemo } from 'react';
import { Project, Language, SkillType } from '../types';
import { VelocityCarousel } from './VelocityCarousel';

interface ProjectsSectionProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] pb-4">
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
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-black'
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

      {/* 3D Velocity Carousel */}
      <VelocityCarousel
        projects={filteredProjects}
        lang={lang}
        onSelectProject={onSelectProject}
        onHoverItem={onHoverItem}
        onLeaveItem={onLeaveItem}
      />
    </div>
  );
};
