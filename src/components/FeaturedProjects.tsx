import React, { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const EASE = [0.16, 1, 0.3, 1] as const;

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
  projects,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [isPinEnabled] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      window.matchMedia('(min-width: 640px)').matches
  );

  useLayoutEffect(() => {
    if (!isPinEnabled || !stageRef.current) return;
    const images = imageRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (images.length < 2) return;

    const ctx = gsap.context(() => {
      images.forEach((img, i) => {
        gsap.set(img, { opacity: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 1.06 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          end: `+=${(images.length - 1) * 100}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(images.length - 1, Math.round(self.progress * (images.length - 1)));
            setActiveIndex((prev) => (prev === idx ? prev : idx));
          },
        },
      });

      for (let i = 0; i < images.length - 1; i++) {
        tl.to(images[i], { opacity: 0, scale: 0.96, duration: 1, ease: 'power1.inOut' }, i).fromTo(
          images[i + 1],
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 1, ease: 'power1.inOut' },
          i
        );
      }
    }, stageRef);

    return () => ctx.revert();
  }, [isPinEnabled, projects]);

  if (projects.length === 0) return null;

  const active = projects[activeIndex] ?? projects[0];

  return (
    <div className="mb-10">
      {isPinEnabled ? (
        <div ref={stageRef} className="relative h-screen w-full overflow-hidden">
          <div className="grid h-full grid-cols-12 items-center gap-8 lg:gap-12">
            {/* Colonne texte, sticky visuellement grâce au pin */}
            <div className="col-span-5 flex flex-col gap-8">
              <p className="max-w-sm font-mono text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {lang === 'fr'
                  ? 'Une sélection de réalisations récentes. Chaque projet détaille le besoin, l’approche et le résultat livré.'
                  : 'A selection of recent work. Each project covers the brief, the approach, and the delivered result.'}
              </p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  onMouseEnter={() => onHoverItem?.(active.title.toUpperCase())}
                  onMouseLeave={onLeaveItem}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">
                      {active.category}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {active.year}
                    </span>
                  </div>

                  <h3 className="font-urbanist text-4xl font-black leading-[0.95] tracking-tight text-zinc-950 dark:text-white lg:text-6xl">
                    {active.title}
                  </h3>

                  <p className="max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 lg:text-base">
                    {active.subtitle}
                  </p>

                  {active.metrics && active.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-8 pt-2">
                      {active.metrics.slice(0, 2).map((metric) => (
                        <div key={metric.label}>
                          <p
                            className="font-mono font-black leading-none tracking-tight text-zinc-950 dark:text-white"
                            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)' }}
                          >
                            {metric.value}
                          </p>
                          <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {(active.liveUrl || active.githubUrl) && (
                      <a
                        href={active.liveUrl || active.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-urbanist font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-950"
                      >
                        <span>{lang === 'fr' ? 'Voir le projet' : 'View project'}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectProject(active)}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-urbanist font-bold text-zinc-950 transition-all hover:bg-zinc-100 active:scale-95 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                    >
                      <Info className="h-4 w-4" />
                      <span>{lang === 'fr' ? 'Détails' : 'Details'}</span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Compteur + progression */}
              <div className="mt-auto flex items-center gap-4 pt-6">
                <span className="font-mono text-xs font-bold text-zinc-400">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2">
                  {projects.map((project, index) => (
                    <span
                      key={project.id}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === activeIndex ? 'w-6 bg-zinc-950 dark:bg-white' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne image, crossfade au scroll */}
            <div className="relative col-span-7 h-[80vh] overflow-hidden rounded-[2.5rem] bg-zinc-950 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  ref={(el) => {
                    imageRefs.current[index] = el;
                  }}
                  className="absolute inset-0"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover brightness-[1.03] saturate-[1.1]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {projects.map((project) => (
            <MobileFeaturedCard
              key={project.id}
              project={project}
              lang={lang}
              onSelectProject={onSelectProject}
              onHoverItem={onHoverItem}
              onLeaveItem={onLeaveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MobileFeaturedCard: React.FC<{
  project: Project;
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}> = ({ project, lang, onSelectProject, onHoverItem, onLeaveItem }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
      onMouseEnter={() => onHoverItem?.(project.title.toUpperCase())}
      onMouseLeave={onLeaveItem}
      className="flex flex-col gap-5"
    >
      <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden rounded-[2rem] bg-zinc-950">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover brightness-[1.03] saturate-[1.1]"
          loading="lazy"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">
          {project.category}
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {project.year}
        </span>
      </div>

      <h3 className="font-urbanist text-3xl font-black leading-[0.95] tracking-tight text-zinc-950 dark:text-white">
        {project.title}
      </h3>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{project.subtitle}</p>

      {project.metrics && project.metrics.length > 0 && (
        <div className="flex flex-wrap gap-6">
          {project.metrics.slice(0, 2).map((metric) => (
            <div key={metric.label}>
              <p className="font-mono text-2xl font-black leading-none tracking-tight text-zinc-950 dark:text-white">
                {metric.value}
              </p>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {(project.liveUrl || project.githubUrl) && (
          <a
            href={project.liveUrl || project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-urbanist font-bold text-white shadow-lg active:scale-95 dark:bg-white dark:text-zinc-950"
          >
            <span>{lang === 'fr' ? 'Voir le projet' : 'View project'}</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onSelectProject(project)}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-urbanist font-bold text-zinc-950 active:scale-95 dark:border-white/15 dark:bg-transparent dark:text-white"
        >
          <Info className="h-4 w-4" />
          <span>{lang === 'fr' ? 'Détails' : 'Details'}</span>
        </button>
      </div>
    </motion.div>
  );
};
