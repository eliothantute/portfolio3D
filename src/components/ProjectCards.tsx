import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Project, Language } from '../types';

const TWO_PI = Math.PI * 2;

const normalizeAngleDelta = (angle: number) => {
  if (angle > Math.PI) return angle - TWO_PI;
  if (angle < -Math.PI) return angle + TWO_PI;
  return angle;
};

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
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const animationRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const orbitAngleRef = useRef(0);
  const orbitTargetRef = useRef(0);
  const isSnappingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isVisibleRef = useRef(true);
  const lastAppliedAngleRef = useRef(Number.NaN);
  const orbitRadiusRef = useRef(290);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const orbitProjects = useMemo(() => projects.slice(0, Math.min(6, projects.length)), [projects]);
  const slots = Math.max(orbitProjects.length, 1);
  const slotAngle = (Math.PI * 2) / slots;

  const applyOrbitalLayout = () => {
    const radius = orbitRadiusRef.current;
    const angle = orbitAngleRef.current;

    if (
      Number.isFinite(lastAppliedAngleRef.current)
      && Math.abs(angle - lastAppliedAngleRef.current) < 0.0002
      && !isSnappingRef.current
    ) {
      return;
    }

    lastAppliedAngleRef.current = angle;

    for (let idx = 0; idx < slots; idx += 1) {
      const node = cardRefs.current[idx];
      if (!node) continue;

      const theta = angle + idx * slotAngle;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta * 1.3) * Math.max(16, radius * 0.12);
      const z = Math.sin(theta) * Math.max(110, radius * 0.62);
      const depth = (Math.sin(theta) + 1) / 2;
      const scale = 0.5 + depth * 0.7;
      const opacity = 0.18 + depth * 0.9;
      const saturation = 0.8 + depth * 0.35;
      const rotateY = Math.cos(theta) * -10;
      const zIndex = Math.round(depth * 100 + 10);

      node.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
      node.style.zIndex = String(zIndex);
      node.style.opacity = String(opacity);
      node.style.filter = `saturate(${saturation})`;
    }
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!previousTimeRef.current) {
        previousTimeRef.current = time;
      }

      const delta = time - previousTimeRef.current;
      previousTimeRef.current = time;

      if (!isVisibleRef.current && !isSnappingRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!isPausedRef.current) {
        orbitTargetRef.current += delta * 0.00024;
      }

      const deltaToTarget = normalizeAngleDelta(orbitTargetRef.current - orbitAngleRef.current);
      const catchup = isSnappingRef.current ? 1 - Math.exp(-delta * 0.018) : 1 - Math.exp(-delta * 0.0095);
      orbitAngleRef.current += deltaToTarget * catchup;

      if (isSnappingRef.current && Math.abs(deltaToTarget) < 0.0009) {
        isSnappingRef.current = false;
      }

      applyOrbitalLayout();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [slotAngle, slots]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!stageRef.current) return;

    const updateRadius = () => {
      if (!stageRef.current) return;
      const width = stageRef.current.clientWidth;
      const computed = Math.max(120, Math.min(330, width * 0.33));
      orbitRadiusRef.current = computed;
      applyOrbitalLayout();
    };

    updateRadius();
    const observer = new ResizeObserver(updateRadius);
    observer.observe(stageRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.12 }
    );

    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    applyOrbitalLayout();
  }, [selectedIdx, slotAngle, slots]);

  const focusCard = (index: number) => {
    const normalized = (index + slots) % slots;
    const desired = Math.PI / 2 - normalized * slotAngle;
    const current = orbitAngleRef.current;
    const turns = Math.round((current - desired) / TWO_PI);

    setSelectedIdx(normalized);
    orbitTargetRef.current = desired + turns * TWO_PI;
    isSnappingRef.current = true;
  };

  const handlePrevious = () => {
    setIsPaused(true);
    focusCard(selectedIdx - 1);
  };

  const handleNext = () => {
    setIsPaused(true);
    focusCard(selectedIdx + 1);
  };

  const handleCardClick = (project: Project, index: number) => {
    setIsPaused(true);
    focusCard(index);
    onSelectProject(project);
  };

  return (
    <section
      id="projects"
      className="relative z-10 overflow-hidden border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_46%,#ffffff_100%)] py-28"
    >
      <div className="pointer-events-none absolute -top-24 right-[8%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(115,160,255,0.2)_0%,rgba(115,160,255,0)_72%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 left-[12%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,132,96,0.1)_0%,rgba(255,132,96,0)_72%)] blur-2xl" />

      <div className="mx-auto mb-14 flex max-w-7xl flex-col justify-between gap-6 px-6 sm:flex-row sm:items-end sm:px-16">
        <div className="max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-slate-500">
            <span className="h-px w-8 bg-slate-300" />
            Selected Work
          </span>
          <h2 className="font-display text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            {lang === 'fr' ? 'Projets signés & expériences immersives' : 'Signature projects and immersive experiences'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevious}
            onMouseEnter={() => onHoverItem?.('PREV')}
            onMouseLeave={onLeaveItem}
            className="lux-interactive flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 hover:border-slate-700 hover:text-slate-900"
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            onMouseEnter={() => onHoverItem?.('NEXT')}
            onMouseLeave={onLeaveItem}
            className="lux-interactive flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 hover:border-slate-700 hover:text-slate-900"
            aria-label="Next project"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        onMouseEnter={() => {
          setIsPaused(true);
          onHoverItem?.('ORBIT');
        }}
        onMouseLeave={() => {
          setIsPaused(false);
          onLeaveItem?.();
        }}
        className="relative mx-auto h-[640px] w-full max-w-7xl overflow-hidden px-2 [perspective:1900px] [transform-style:preserve-3d] sm:h-[700px]"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-[radial-gradient(circle,rgba(148,172,236,0.24)_0%,rgba(148,172,236,0.08)_38%,rgba(255,255,255,0)_74%)] shadow-[0_0_80px_rgba(74,108,197,0.18)] sm:h-[340px] sm:w-[340px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/60" />

        {orbitProjects.map((project, idx) => {
          const selected = idx === selectedIdx;

          return (
            <div
              key={`${project.id}-${idx}`}
              ref={(node) => {
                cardRefs.current[idx] = node;
              }}
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={{
                transform: 'translate(-50%, -50%)',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
              }}
            >
              <ProjectCard
                project={project}
                lang={lang}
                isSelected={selected}
                onClick={() => handleCardClick(project, idx)}
                onHoverItem={onHoverItem}
                onLeaveItem={onLeaveItem}
              />
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:px-16">
        <span>{lang === 'fr' ? 'Cliquer pour sélectionner un projet' : 'Click to select a project'}</span>
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className="lux-interactive rounded-full border border-slate-300 px-4 py-1.5 text-[9px] text-slate-600 hover:border-slate-700 hover:text-slate-900"
        >
          {isPaused ? (lang === 'fr' ? 'Relancer rotation' : 'Resume rotation') : (lang === 'fr' ? 'Pause rotation' : 'Pause rotation')}
        </button>
      </div>
    </section>
  );
};

interface ProjectCardProps {
  project: Project;
  lang: Language;
  isSelected: boolean;
  onClick: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  lang,
  isSelected,
  onClick,
  onHoverItem,
  onLeaveItem,
}) => {
  return (
    <article
      onMouseEnter={() => onHoverItem?.('OPEN')}
      onMouseLeave={onLeaveItem}
      onClick={onClick}
      className={`lux-interactive group relative flex h-[440px] w-[280px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[1.7rem] border bg-[linear-gradient(155deg,rgba(255,255,255,0.98)_0%,rgba(246,249,255,0.95)_100%)] backdrop-blur-xl sm:h-[490px] sm:w-[350px] ${
        isSelected
          ? 'border-slate-900 shadow-[0_36px_100px_rgba(15,23,42,0.3)] ring-2 ring-slate-900/30'
          : 'border-slate-200 shadow-[0_16px_54px_rgba(23,33,59,0.14)] hover:border-slate-300'
      }`}
    >
      {isSelected && (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-[1.65rem] border border-slate-900/65" />
          <div className="pointer-events-none absolute -inset-4 rounded-[2rem] border border-slate-900/20" />
          <span className="absolute right-4 top-4 z-10 rounded-full bg-slate-900 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white">
            Actif
          </span>
        </>
      )}

      <div className="relative h-52 overflow-hidden bg-slate-100 sm:h-60">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(15,23,42,0.28)_100%)]" />

        <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/70 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-slate-700 backdrop-blur-md">
          {project.category}
        </span>
      </div>

      <div className="flex grow flex-col justify-between p-6 sm:p-7">
        <div>
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>{project.year}</span>
            <span>{project.status}</span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.8rem]">{project.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{project.description}</p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {project.stack.slice(0, 3).map((item, idx) => (
              <span
                key={`${project.id}-${idx}`}
                className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-slate-700">
            <span>{lang === 'fr' ? 'Ouvrir étude de cas' : 'Open case study'}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </article>
  );
};
