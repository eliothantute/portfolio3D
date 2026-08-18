import React, { useMemo, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Project, Language } from '../types';

const cardRevealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: index * 0.12, // 120ms between cards; adjust this for a faster/slower cascade.
      ease: [0.22, 0.61, 0.36, 1],
    },
  }),
};

const cardHoverTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

const getOrbitOffset = (index: number, activeIndex: number, total: number) => {
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
};

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
  const lastWheelAt = useRef(0);

  const handleCardClick = (project: Project, index: number) => {
    setSelectedIdx(index);
    onSelectProject(project);
  };

  const scrollProjects = (direction: number) => {
    setSelectedIdx((current) => (current + direction + featuredProjects.length) % featuredProjects.length);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastWheelAt.current < 420 || Math.abs(event.deltaY) < 12) return;
    lastWheelAt.current = now;
    scrollProjects(event.deltaY > 0 ? 1 : -1);
  };

  return (
    <section
      id="projects"
      className="relative z-10 overflow-hidden border-t border-slate-200 bg-white py-16 sm:py-20"
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

        <div className="projects-orbit-shell" onWheel={handleWheel}>
          <div className="projects-orbit-stage" aria-label={lang === 'fr' ? 'Carousel orbital des projets. Faites défiler pour changer de projet.' : 'Orbital project carousel. Scroll to change project.'}>
          {featuredProjects.map((project, idx) => {
            const offset = getOrbitOffset(idx, selectedIdx, featuredProjects.length);
            const visible = Math.abs(offset) <= 1;
            const orbitRadius = Math.min(window.innerWidth * 0.44, 500);
            const x = offset * orbitRadius;
            const z = offset === 0 ? 0 : -150;
            const y = offset === 0 ? 0 : 18;
            const rotationY = offset * -0.3;
            const scale = offset === 0 ? 1 : 0.74;

            return visible ? (
            <motion.div
              className="projects-orbit-slide"
              key={`${project.id}-${idx}`}
              animate={{
                x,
                y,
                z,
                rotateY: rotationY,
                scale,
                opacity: offset === 0 ? 1 : 0.76,
              }}
              transition={{ type: 'spring', stiffness: 125, damping: 19, mass: 0.85 }}
              transformTemplate={(_, generatedTransform) => `translate(-50%, -50%) ${generatedTransform}`}
              style={{ zIndex: 10 - Math.abs(offset) }}
              onClick={() => {
                if (offset !== 0) setSelectedIdx(idx);
              }}
            >
              <ProjectCard
                project={project}
                lang={lang}
                isSelected={idx === selectedIdx}
                onHover={() => {
                  onHoverItem?.(lang === 'fr' ? 'VOIR LE PROJET' : 'VIEW PROJECT');
                }}
                onLeave={onLeaveItem}
                onClick={() => handleCardClick(project, idx)}
                index={idx}
              />
            </motion.div>
            ) : null;
          })}
          </div>
          <div className="projects-carousel-controls">
            <button type="button" className="projects-carousel-arrow" onClick={() => scrollProjects(-1)} aria-label={lang === 'fr' ? 'Projets précédents' : 'Previous projects'}>←</button>
            <span className="projects-carousel-caption">{lang === 'fr' ? 'Faire défiler pour explorer' : 'Scroll to explore'}</span>
            <button type="button" className="projects-carousel-arrow" onClick={() => scrollProjects(1)} aria-label={lang === 'fr' ? 'Projets suivants' : 'Next projects'}>→</button>
          </div>
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
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  lang,
  isSelected,
  onHover,
  onLeave,
  onClick,
  index,
}) => {
  const meta = `${project.stack.slice(0, 4).join(' • ')}`;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={cardRevealVariants}
      whileHover={{
        scale: 1.035,
        boxShadow: '0 26px 60px rgba(23, 33, 59, 0.18)',
      }}
      transition={cardHoverTransition}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onLeave?.();
      }}
      onClick={onClick}
      className="group cursor-pointer rounded-[26px]"
    >
      <div className="relative overflow-hidden rounded-[26px] bg-slate-100">
        <img
          src={project.image}
          alt={project.title}
          className="aspect-[16/10] h-full w-full object-cover transition-[transform,filter] duration-700 ease-[var(--ease-standard)] group-hover:scale-[1.14] group-hover:-translate-y-2 group-hover:rotate-[-1deg] group-hover:saturate-110 group-hover:contrast-105"
        />
        {project.video && (
          <video
            src={project.video}
            muted
            loop
            autoPlay={isHovered}
            playsInline
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 aspect-[16/10] h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(15,23,42,0.08)_56%,rgba(15,23,42,0.34)_100%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 h-24 translate-y-5 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.14)_18%,rgba(255,255,255,0.02)_100%)] opacity-0 blur-[2px] transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10" />
      </div>

      <div className="mt-4 sm:mt-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 opacity-80 transition-[transform,opacity] duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100">
          {meta}
        </div>
        <h3 className="flex items-baseline gap-3 text-[2rem] font-medium leading-none tracking-tight text-[#15161a] transition-[transform,opacity] duration-500 ease-[var(--ease-standard)] group-hover:-translate-y-0.5 group-hover:translate-x-4 sm:text-[3.15rem]">
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
    </motion.article>
  );
};
