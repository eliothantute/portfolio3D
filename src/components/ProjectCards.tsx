import React, { useMemo, useState } from 'react';
import { Project, Language } from '../types';

const renderStaggeredTitle = (text: string, baseDelay = 0) =>
  text.split('').map((character, index) => (
    <span
      key={`${text}-${index}`}
      className="project-title-char reveal-title-char"
      style={{
        '--reveal-delay': `${baseDelay + index * 0.035}s`,
        transitionDelay: `${index * 28}ms`,
      } as React.CSSProperties}
    >
      {character === ' ' ? '\u00A0' : character}
    </span>
  ));

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
      className="relative z-10 overflow-hidden border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fd_100%)] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6 sm:mb-12">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">Selected Work</span>
            <h2
              className="font-display text-4xl leading-none tracking-tight text-[#111216] sm:text-6xl"
              aria-label={lang === 'fr' ? 'Projets' : 'Projects'}
            >
              <span className="inline-flex flex-wrap">
                {renderStaggeredTitle(lang === 'fr' ? 'Projets' : 'Projects', 0.08)}
              </span>
            </h2>
          </div>
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
            className="aspect-[16/10] h-full w-full object-cover transition-[transform,filter] duration-700 ease-[var(--ease-standard)] group-hover:scale-[1.14] group-hover:-translate-y-2 group-hover:rotate-[-1deg] group-hover:saturate-110 group-hover:contrast-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(15,23,42,0.08)_56%,rgba(15,23,42,0.34)_100%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 h-24 translate-y-5 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.14)_18%,rgba(255,255,255,0.02)_100%)] opacity-0 blur-[2px] transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10" />
      </div>

      <div className="mt-4 sm:mt-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">
          {meta}
        </div>
        <h3 className="flex items-baseline gap-3 text-[2rem] font-medium leading-none tracking-tight text-[#15161a] transition-transform duration-500 ease-[var(--ease-standard)] group-hover:translate-x-4 sm:text-[3.15rem]">
          <span
            className={`text-[2rem] leading-none transition-all duration-300 ease-[var(--ease-standard)] sm:text-[3rem] ${
              isSelected ? 'opacity-100' : 'opacity-25 group-hover:opacity-65'
            }`}
          >
            →
          </span>
          <span aria-label={project.title} className="inline-flex flex-wrap group-hover:tracking-[0.05em]">
            {renderStaggeredTitle(project.title, 0.02)}
          </span>
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
