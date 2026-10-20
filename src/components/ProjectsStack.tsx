import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionValue, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { Project, Language } from '../types';

interface ProjectsStackProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const VIEW_ANGLE = -30;
const CARD_TILT = -18;
const SPEED = 0.45; // cards per second

const mod = (n: number, m: number) => ((n % m) + m) % m;

const openProject = (project: Project, onSelect: (p: Project) => void) => {
  const url = project.liveUrl || project.githubUrl;
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
  else onSelect(project);
};

interface Layout {
  cardW: number;
  cardH: number;
  spacing: number;
  depth: number;
  count: number;
}

// A card's place in the deck is a float slot (0 = front, count = back) derived from
// the shared phase, so the whole deck glides forward and wraps around forever.
const DeckCard: React.FC<{
  project: Project;
  index: number;
  phase: MotionValue<number>;
  layout: Layout;
  onOpen: () => void;
  onHover: () => void;
}> = ({ project, index, phase, layout, onOpen, onHover }) => {
  const { cardW, cardH, spacing, depth, count } = layout;
  const slot = useTransform(phase, (p) => mod(index - p, count));
  const centre = ((count - 1) * spacing) / 2;
  const x = useTransform(slot, (s) => s * spacing - centre - cardW / 2);
  const z = useTransform(slot, (s) => -s * depth);
  const opacity = useTransform(slot, (s) => Math.min(1, s / 0.6, (count - s) / 0.8));
  const zIndex = useTransform(slot, (s) => Math.round(1000 - s * 10));

  return (
    <motion.button
      type="button"
      aria-label={project.title}
      className="pointer-events-auto absolute left-0 top-0 cursor-pointer overflow-hidden rounded-xl bg-white p-0 text-left sm:rounded-2xl"
      style={{ width: cardW, height: cardH, x, y: -cardH / 2, z, rotateY: CARD_TILT, opacity, zIndex, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      onMouseEnter={onHover}
      onClick={onOpen}
    >
      <img src={project.image} alt="" draggable={false} loading="lazy" className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10">
        <span className="font-urbanist text-base text-white sm:text-lg">{project.title}</span>
      </div>
    </motion.button>
  );
};

export const ProjectsStack: React.FC<ProjectsStackProps> = ({ projects, lang, onSelectProject, onHoverItem, onLeaveItem }) => {
  const fr = lang === 'fr';
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [focused, setFocused] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const phase = useMotionValue(0);
  const speed = useRef(1);
  const hovering = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useEffect(() => setFocused(null), [projects]);

  useAnimationFrame((_, delta) => {
    if (!inView || reduceMotion.current) return;
    const target = hovering.current || focused !== null ? 0 : 1;
    speed.current += (target - speed.current) * 0.06;
    if (speed.current > 0.001) phase.set(phase.get() + (SPEED * speed.current * Math.min(delta, 50)) / 1000);
  });

  const step = useCallback(
    (dir: 1 | -1) => setFocused((f) => (f === null ? f : mod(f + dir, projects.length))),
    [projects.length],
  );

  useEffect(() => {
    if (focused === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocused(null);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused, step]);

  if (projects.length === 0) return null;

  const isMobile = size.w > 0 && size.w <= 768;
  const cardW = isMobile ? Math.min(220, size.w * 0.55) : Math.min(280, size.w * 0.26);
  const layout: Layout = {
    cardW,
    cardH: cardW * 0.75,
    spacing: Math.min(isMobile ? 60 : 110, (size.w * (isMobile ? 0.4 : 0.5)) / Math.max(projects.length - 1, 1)),
    depth: isMobile ? 80 : 100,
    count: projects.length,
  };
  const active = focused !== null ? projects[focused] : null;

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 h-[80vh] min-h-[520px] w-screen -translate-x-1/2 overflow-hidden"
      style={{ perspective: 2000 }}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => {
        hovering.current = false;
        onLeaveItem?.();
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2"
        // The tilt lifts the back of the deck, so drop the anchor by ~a fifth of its depth to keep it centred.
        style={{ top: `calc(50% + ${layout.depth * layout.count * 0.18}px)`, transform: `rotateX(${VIEW_ANGLE}deg)`, transformStyle: 'preserve-3d' }}
      >
        {projects.map((project, index) => (
          <DeckCard
            key={project.id}
            project={project}
            index={index}
            phase={phase}
            layout={layout}
            onOpen={() => setFocused(index)}
            onHover={() => onHoverItem?.(project.title.toUpperCase())}
          />
        ))}
      </div>

      <p className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 sm:left-6 sm:top-6 sm:text-xs">
        {fr ? 'Survoler pour arrêter · Cliquer pour ouvrir' : 'Hover to pause · Click to open'}
      </p>

      <AnimatePresence>
        {active && (
          <motion.div
            key="focus"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-[2000] flex flex-col items-center justify-center gap-5 bg-white/80 p-4 backdrop-blur-md dark:bg-black/80"
            onClick={() => setFocused(null)}
          >
            <button
              type="button"
              aria-label={fr ? 'Fermer le projet' : 'Close project'}
              onClick={() => setFocused(null)}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-950 dark:border-white/20 dark:text-white sm:right-6 sm:top-6"
            >
              <X className="h-4 w-4" />
            </button>
            <AnimatePresence mode="wait">
              <motion.img
                key={active.id}
                src={active.image}
                alt={active.title}
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 250, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[55%] w-auto max-w-[90%] rounded-2xl object-cover shadow-2xl"
              />
            </AnimatePresence>
            <div className="flex flex-col items-center gap-3 text-center" onClick={(e) => e.stopPropagation()}>
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 sm:text-xs">
                {String(focused! + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} — {(active.role ?? []).slice(0, 2).join(' • ')}
              </p>
              <h3 className="font-urbanist text-2xl text-zinc-950 dark:text-white sm:text-4xl">{active.title}</h3>
              <button
                type="button"
                onClick={() => openProject(active, onSelectProject)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-zinc-950 px-5 font-mono text-[11px] font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.03] dark:bg-white dark:text-zinc-950"
              >
                {fr ? 'Voir le projet' : 'View project'}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
