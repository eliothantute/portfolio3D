import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from 'framer-motion';
import { Language, SkillType } from '../types';
import { skillsCategories } from '../data/projects';
import { InteractiveText } from './InteractiveText';

interface SkillsVelocityCarouselProps {
  lang: Language;
  onSelectSkill: (skillType: SkillType) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Visual art styling themes for each skill category
const skillVisuals = {
  frontend: {
    bgGradient: 'from-blue-950 via-zinc-950 to-black',
    accentColor: '#0066ff',
    badgeText: '01 // REACT 19 & THREE.JS',
    glowColor: 'rgba(0, 102, 255, 0.35)',
    graphicCode: (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 pointer-events-none">
        <div className="h-72 w-72 rounded-full border border-blue-500/30 animate-spin [animation-duration:20s]" />
        <div className="absolute h-56 w-56 rounded-full border border-dashed border-cyan-400/40 animate-spin [animation-duration:15s] [animation-direction:reverse]" />
        <div className="absolute h-40 w-40 rounded-full border border-blue-600/50" />
        <div className="absolute font-mono text-[11px] text-cyan-300 font-bold tracking-widest uppercase">
          &lt;THREE.JS / R3F /&gt;
        </div>
      </div>
    ),
  },
  design: {
    bgGradient: 'from-zinc-900 via-stone-950 to-black',
    accentColor: '#a1a1aa',
    badgeText: '02 // FIGMA & DESIGN SYSTEMS',
    glowColor: 'rgba(255, 255, 255, 0.25)',
    graphicCode: (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 pointer-events-none">
        <div className="grid grid-cols-4 gap-4 p-8 w-full h-full opacity-40">
          <div className="border border-white/20 rounded-2xl p-4 flex flex-col justify-between">
            <div className="h-3 w-8 bg-white/40 rounded-full" />
            <div className="h-12 bg-white/10 rounded-xl" />
          </div>
          <div className="border border-white/20 rounded-2xl p-4 flex flex-col justify-between col-span-2">
            <div className="h-3 w-16 bg-white/40 rounded-full" />
            <div className="h-12 bg-white/10 rounded-xl" />
          </div>
          <div className="border border-white/20 rounded-2xl p-4 flex flex-col justify-between">
            <div className="h-3 w-8 bg-white/40 rounded-full" />
            <div className="h-12 bg-white/10 rounded-xl" />
          </div>
        </div>
        <div className="absolute font-mono text-[11px] text-zinc-300 font-bold tracking-widest uppercase">
          [FIGMA → CODE // UI/UX]
        </div>
      </div>
    ),
  },
  app: {
    bgGradient: 'from-emerald-950 via-zinc-950 to-black',
    accentColor: '#10b981',
    badgeText: '03 // AGENTS IA & PWA',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    graphicCode: (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 pointer-events-none">
        <div className="h-64 w-64 border border-emerald-500/30 rotate-45 animate-pulse" />
        <div className="absolute h-48 w-48 border border-dashed border-emerald-400/40 rotate-12" />
        <div className="absolute font-mono text-[11px] text-emerald-400 font-bold tracking-widest uppercase">
          {'{ AGENTIC // LLM // PWA }'}
        </div>
      </div>
    ),
  },
  music: {
    bgGradient: 'from-purple-950 via-zinc-950 to-black',
    accentColor: '#a855f7',
    badgeText: '04 // SOUND DESIGN & COMPOSITION',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    graphicCode: (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 pointer-events-none">
        <div className="flex items-center gap-1.5 h-20">
          <div className="w-2 h-10 bg-purple-400 rounded-full animate-pulse" />
          <div className="w-2 h-16 bg-fuchsia-400 rounded-full animate-pulse [animation-delay:150ms]" />
          <div className="w-2 h-12 bg-purple-300 rounded-full animate-pulse [animation-delay:300ms]" />
          <div className="w-2 h-20 bg-violet-400 rounded-full animate-pulse [animation-delay:450ms]" />
          <div className="w-2 h-14 bg-purple-400 rounded-full animate-pulse [animation-delay:200ms]" />
          <div className="w-2 h-8 bg-fuchsia-300 rounded-full animate-pulse [animation-delay:350ms]" />
        </div>
        <div className="absolute font-mono text-[11px] text-purple-300 font-bold tracking-widest uppercase mt-28">
          ♪ SOUNDTRACK &amp; AUDIO
        </div>
      </div>
    ),
  },
};

export const SkillsVelocityCarousel: React.FC<SkillsVelocityCarouselProps> = ({
  lang,
  onSelectSkill,
  onHoverItem,
  onLeaveItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  // 3D gyroscopic tilt tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const activeRotateY = useTransform(smoothMouseX, [0, 1], [-12, 12]);
  const activeRotateX = useTransform(smoothMouseY, [0, 1], [10, -10]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const isMobile = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;

  const cardWidth = useMemo(() => {
    if (isMobile) return clamp(containerWidth - 48, 290, 340);
    if (isTablet) return clamp(containerWidth * 0.46, 360, 440);
    return clamp(containerWidth * 0.38, 440, 520);
  }, [containerWidth, isMobile, isTablet]);

  const cardHeight = cardWidth * 1.16;
  const spacing = useMemo(() => {
    if (isMobile) return cardWidth * 1.04;
    if (isTablet) return cardWidth * 1.1;
    return cardWidth * 1.15;
  }, [cardWidth, isMobile, isTablet]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(clamp(index, 0, skillsCategories.length - 1));
  }, []);

  const previous = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? skillsCategories.length - 1 : current - 1));
  }, []);

  const next = useCallback(() => {
    setActiveIndex((current) => (current === skillsCategories.length - 1 ? 0 : current + 1));
  }, []);

  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || isMobile) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      const relativeY = (e.clientY - rect.top) / rect.height;

      mouseX.set(relativeX);
      mouseY.set(relativeY);

      const targetIndex = Math.floor(relativeX * skillsCategories.length);
      const safeTarget = clamp(targetIndex, 0, skillsCategories.length - 1);

      if (safeTarget !== activeIndex && Math.abs(relativeX - 0.5) > 0.12) {
        setActiveIndex(safeTarget);
      }
    },
    [isMobile, mouseX, mouseY, activeIndex]
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = isMobile ? 36 : 56;
      if (info.offset.x > threshold) {
        previous();
      } else if (info.offset.x < -threshold) {
        next();
      }
    },
    [isMobile, previous, next]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className="relative flex w-full flex-col items-center justify-center overflow-hidden py-10 select-none [perspective:1600px]"
      style={{ minHeight: cardHeight + 140 }}
    >
      {/* 3D Cards Stage */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragEnd={handleDragEnd}
        className="relative flex h-full w-full items-center justify-center cursor-grab active:cursor-grabbing [transform-style:preserve-3d]"
        style={{ height: cardHeight, touchAction: 'pan-y' }}
      >
        {skillsCategories.map((cat, index) => {
          const isActive = index === activeIndex;
          const distance = index - activeIndex;
          const absDistance = Math.abs(distance);
          const x = distance * spacing;

          const rotateYAngle = distance * -12;
          const zDepth = isActive ? 0 : -absDistance * 110;
          const scale = isActive ? 1 : hoveredIndex === index ? 0.94 : 0.88;
          const opacity = absDistance > 2 ? 0.35 : absDistance === 2 ? 0.65 : 1;

          const visual = skillVisuals[cat.type];

          return (
            <motion.div
              key={cat.type}
              role={isActive ? 'group' : 'button'}
              tabIndex={0}
              onMouseEnter={() => {
                setHoveredIndex(index);
                onHoverItem?.(cat.title[lang].toUpperCase());
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                onLeaveItem?.();
              }}
              onClick={() => {
                if (!isActive) {
                  goTo(index);
                } else {
                  onSelectSkill(cat.type);
                }
              }}
              animate={{
                x,
                scale,
                opacity,
                rotateY: isActive ? 0 : rotateYAngle,
                z: zDepth,
              }}
              style={{
                width: cardWidth,
                height: cardHeight,
                rotateX: isActive ? activeRotateX : 0,
                rotateY: isActive ? activeRotateY : rotateYAngle,
              }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`absolute top-0 flex flex-col justify-between overflow-hidden rounded-[36px] bg-gradient-to-b ${visual.bgGradient} transition-all duration-300 [transform-style:preserve-3d] ${
                isActive
                  ? 'cursor-pointer z-30 ring-1 ring-white/20'
                  : 'cursor-pointer z-10 brightness-[0.75] hover:brightness-100'
              }`}
            >
              {/* Active Card Outer Thick White Border Frame */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="pointer-events-none absolute inset-0 z-40 rounded-[36px] border-[9px] border-white shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                />
              )}

              {/* Internal Background Graphic Canvas */}
              {visual.graphicCode}

              {/* Ambient Glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${visual.glowColor}, transparent 70%)`,
                }}
              />

              {/* Top Row: Skill Category Tag */}
              <div className="relative z-10 p-7 sm:p-8 flex items-center justify-between">
                <span className="rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white border border-white/15">
                  {visual.badgeText}
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-400">
                  {cat.projectIds.length} {lang === 'fr' ? 'projets' : 'projects'}
                </span>
              </div>

              {/* Bottom Content Card Info with 3D Depth */}
              <div className="relative z-20 p-7 sm:p-8 bg-gradient-to-t from-black via-black/85 to-transparent [transform:translateZ(30px)]">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {cat.subtitle[lang]}
                </p>

                <h3 className="font-display mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                  {cat.title[lang]}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                  {cat.description[lang]}
                </p>

                {/* Skill Badges Row */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cat.skills.slice(0, 5).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 px-2.5 py-1 font-mono text-[10px] font-medium text-white/90"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Active Pill Action Button */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="mt-6"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSkill(cat.type);
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-sans text-xs sm:text-sm font-bold text-zinc-950 shadow-xl transition-transform hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <span>
                        {lang === 'fr'
                          ? `Explorer les projets ${cat.type.toUpperCase()}`
                          : `Explore ${cat.type.toUpperCase()} Projects`}
                      </span>
                      <span className="text-base">↗</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navigation Indicators / Pagination Dots */}
      <div className="relative z-30 mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={previous}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-950 font-bold shadow-sm transition-all hover:bg-zinc-950 hover:text-white"
          aria-label="Previous Skill"
        >
          ←
        </button>

        <div className="flex items-center gap-2">
          {skillsCategories.map((cat, idx) => (
            <button
              key={cat.type}
              type="button"
              onClick={() => goTo(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-8 bg-zinc-950' : 'w-2.5 bg-zinc-300 hover:bg-zinc-500'
              }`}
              aria-label={`Go to skill ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-950 font-bold shadow-sm transition-all hover:bg-zinc-950 hover:text-white"
          aria-label="Next Skill"
        >
          →
        </button>
      </div>
    </div>
  );
};
