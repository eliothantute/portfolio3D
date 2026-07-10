import React, { useMemo, useState } from 'react';
import { Project, Language } from '../types';

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
  const featuredProjects = useMemo(() => projects.slice(0, Math.min(6, projects.length)), [projects]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleCardClick = (project: Project, index: number) => {
    setSelectedIdx(index);
    onSelectProject(project);
  };

  return (
    <section
      id="projects"
      className="relative z-10 overflow-hidden border-t border-slate-200 bg-[#e8eaef] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6 sm:mb-12">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">Selected Work</span>
            <h2 className="font-display text-4xl leading-none tracking-tight text-[#111216] sm:text-6xl">
              {lang === 'fr' ? 'Projets signature' : 'Featured Work'}
            </h2>
          </div>
          <span className="hidden rounded-full border border-slate-400/45 bg-white/65 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700 sm:inline-flex">
            {lang === 'fr' ? 'Sélection 2026' : 'Selection 2026'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-2">
          {featuredProjects.map((project, idx) => (
            <ProjectCard
              key={`${project.id}-${idx}`}
              project={project}
              lang={lang}
              isSelected={idx === selectedIdx}
              onHover={() => {
                setSelectedIdx(idx);
                onHoverItem?.('OPEN');
              }}
              onLeave={onLeaveItem}
              onClick={() => handleCardClick(project, idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface ProjectCardProps {
  project: Project;
  lang: Language;
  isSelected: boolean;
  onHover: () => void;
  onLeave?: () => void;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  lang,
  isSelected,
  onHover,
  onLeave,
  onClick,
}) => {
  const meta = `${project.stack.slice(0, 4).join(' • ')}`;

  return (
    <article
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-[26px] bg-slate-100">
        <img
          src={project.image}
          alt={project.title}
          className="aspect-[16/10] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10" />
      </div>

      <div className="mt-4 sm:mt-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">
          {meta}
        </div>
        <h3 className="flex items-baseline gap-3 text-[2rem] font-medium leading-none tracking-tight text-[#15161a] sm:text-[3.15rem]">
          <span
            className={`text-[2rem] leading-none transition-opacity duration-300 sm:text-[3rem] ${
              isSelected ? 'opacity-100' : 'opacity-25 group-hover:opacity-65'
            }`}
          >
            →
          </span>
          <span>{project.title}</span>
        </h3>
        <p className="mt-3 max-w-[90%] text-sm text-slate-600 sm:text-[15px]">
          {lang === 'fr' ? project.subtitle : project.subtitle}
        </p>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
          {project.year} • {project.status}
        </div>
      </div>
    </article>
  );
};
