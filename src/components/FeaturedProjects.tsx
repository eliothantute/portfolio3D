import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Project, Language } from '../types';
import { ArrowUpRight, Info } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedProjectsProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

// Each featured card enters from a different direction: top, then right, then bottom.
const ENTER_FROM: Array<{ x: number; y: number }> = [
  { x: 0, y: -120 },
  { x: 140, y: 0 },
  { x: 0, y: 120 },
];

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
  projects,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [isPinEnabled] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      window.matchMedia('(min-width: 640px)').matches
  );

  useLayoutEffect(() => {
    if (!isPinEnabled || !stageRef.current) return;
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (cards.length < 2) return;

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.set(card, { opacity: 0, scale: 0.88, x: ENTER_FROM[i]?.x ?? 0, y: ENTER_FROM[i]?.y ?? 0 });
      });
      gsap.set(cards[0], { opacity: 1, scale: 1, x: 0, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          end: `+=${(cards.length - 1) * 100}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)));
            setActiveIndex((prev) => (prev === idx ? prev : idx));
          },
        },
      });

      for (let i = 0; i < cards.length - 1; i++) {
        const next = ENTER_FROM[i + 1] ?? { x: 0, y: 0 };
        tl.to(cards[i], { opacity: 0, scale: 1.08, x: -(next.x / 2), y: -(next.y / 2), duration: 1, ease: 'power1.inOut' }, i)
          .fromTo(
            cards[i + 1],
            { opacity: 0, scale: 0.88, x: next.x, y: next.y },
            { opacity: 1, scale: 1, x: 0, y: 0, duration: 1, ease: 'power1.inOut' },
            i
          );
      }
    }, stageRef);

    return () => ctx.revert();
  }, [isPinEnabled, projects]);

  if (projects.length === 0) return null;

  return (
    <div className="mb-10">
      {isPinEnabled ? (
        <div ref={stageRef} className="relative h-screen w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
          <div className="absolute inset-0">
            {projects.map((project, index) => (
              <div
                key={project.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onMouseEnter={() => onHoverItem?.(project.title.toUpperCase())}
                onMouseLeave={onLeaveItem}
                className="absolute inset-0"
                style={{ willChange: 'transform, opacity' }}
              >
                <FeaturedCard project={project} lang={lang} onSelectProject={onSelectProject} />
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2 z-20">
            {projects.map((project, index) => (
              <span
                key={project.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              onMouseEnter={() => onHoverItem?.(project.title.toUpperCase())}
              onMouseLeave={onLeaveItem}
              className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-[2rem]"
            >
              <FeaturedCard project={project} lang={lang} onSelectProject={onSelectProject} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FeaturedCard: React.FC<{
  project: Project;
  lang: Language;
  onSelectProject: (project: Project) => void;
}> = ({ project, lang, onSelectProject }) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-950">
      <img
        src={project.image}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

      {/* Metrics chips: top-right on desktop, clear of the floating navbar pill on mobile */}
      {project.metrics && project.metrics.length > 0 && (
        <div className="absolute top-6 right-6 hidden sm:flex flex-col gap-2 items-end">
          {project.metrics.slice(0, 3).map((metric) => (
            <div
              key={metric.label}
              className="rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3.5 py-1.5 text-right"
            >
              <span className="block font-mono text-[9px] uppercase tracking-wider text-white/60">{metric.label}</span>
              <span className="block font-mono text-xs font-bold text-white">{metric.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            {project.category}
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/60">
            {project.year}
          </span>
        </div>

        <h3 className="font-urbanist text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
          {project.title}
        </h3>
        <p className="mt-3 max-w-xl text-sm sm:text-base text-white/80 leading-relaxed">
          {project.subtitle}
        </p>

        {project.metrics && project.metrics.length > 0 && (
          <div className="mt-4 flex sm:hidden flex-wrap gap-2">
            {project.metrics.slice(0, 3).map((metric) => (
              <div
                key={metric.label}
                className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1.5"
              >
                <span className="font-mono text-[9px] uppercase tracking-wider text-white/60">{metric.label} </span>
                <span className="font-mono text-[11px] font-bold text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {(project.liveUrl || project.githubUrl) && (
            <a
              href={project.liveUrl || project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-urbanist font-bold text-zinc-950 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Voir le projet' : 'View project'}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProject(project);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-5 py-3 text-sm font-urbanist font-bold text-white transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
          >
            <Info className="h-4 w-4" />
            <span>{lang === 'fr' ? 'Détails' : 'Details'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
