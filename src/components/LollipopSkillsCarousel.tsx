import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, SkillType, StackCategory } from '../types';
import { skillsCategories, stackCategoriesData } from '../data/projects';

interface LollipopSkillsCarouselProps {
  lang: Language;
  onSelectSkill: (skillType: SkillType) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

interface SkillItem {
  id: string;
  type: 'pillar' | 'stack';
  skillCategory?: SkillType;
  title: string;
  subtitle: string;
  description: string;
  skills: string[];
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  badgeText: string;
  icon: string;
  visualGraphic: React.ReactNode;
}

export const LollipopSkillsCarousel: React.FC<LollipopSkillsCarouselProps> = ({
  lang,
  onSelectSkill,
  onHoverItem,
  onLeaveItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Active filter tab: 'all' | 'pillars' | 'stack'
  const [activeTab, setActiveTab] = useState<'all' | 'pillars' | 'stack'>('all');

  // Hovered item identifier (flatIndex)
  const [hoveredFlatIndex, setHoveredFlatIndex] = useState<number | null>(null);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drift position accumulator
  const posRef = useRef(0);
  const dragStartRef = useRef<{ startX: number; startPos: number; lastX: number; lastTime: number; velocity: number }>({
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Capsule dimensions
  const pillWidth = 160;
  const pillHeight = 250;
  const gap = 16;
  const itemStride = pillWidth + gap;

  // Build items list from skillsCategories and stackCategoriesData
  const rawItems: SkillItem[] = useMemo(() => {
    const pillars: SkillItem[] = skillsCategories.map((cat, idx) => {
      if (cat.type === 'frontend') {
        return {
          id: `pillar-${cat.type}`,
          type: 'pillar',
          skillCategory: 'frontend',
          title: cat.title[lang],
          subtitle: cat.subtitle[lang],
          description: cat.description[lang],
          skills: cat.skills,
          accentColor: '#3b82f6',
          glowColor: 'rgba(59, 130, 246, 0.4)',
          bgGradient: 'from-blue-950 via-zinc-950 to-black',
          badgeText: `0${idx + 1} // PÔLE 3D`,
          icon: '✦',
          visualGraphic: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-35 pointer-events-none">
              <div className="h-44 w-44 rounded-full border border-blue-500/40 animate-spin [animation-duration:18s]" />
              <div className="absolute h-32 w-32 rounded-full border border-dashed border-cyan-400/50 animate-spin [animation-duration:12s] [animation-direction:reverse]" />
              <div className="absolute h-20 w-20 rounded-full border border-blue-600/60" />
              <div className="absolute font-mono text-[10px] text-cyan-300 font-bold tracking-widest uppercase">
                &lt;THREE.JS/&gt;
              </div>
            </div>
          ),
        };
      }
      if (cat.type === 'design') {
        return {
          id: `pillar-${cat.type}`,
          type: 'pillar',
          skillCategory: 'design',
          title: cat.title[lang],
          subtitle: cat.subtitle[lang],
          description: cat.description[lang],
          skills: cat.skills,
          accentColor: '#a855f7',
          glowColor: 'rgba(168, 85, 247, 0.4)',
          bgGradient: 'from-fuchsia-950 via-zinc-950 to-black',
          badgeText: `0${idx + 1} // PÔLE DESIGN`,
          icon: '❖',
          visualGraphic: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-35 pointer-events-none">
              <div className="grid grid-cols-2 gap-2.5 p-5 w-full h-full opacity-60">
                <div className="border border-fuchsia-400/30 rounded-xl p-2 flex flex-col justify-between">
                  <div className="h-2 w-6 bg-fuchsia-400/50 rounded-full" />
                  <div className="h-8 bg-fuchsia-400/10 rounded-lg" />
                </div>
                <div className="border border-purple-400/30 rounded-xl p-2 flex flex-col justify-between">
                  <div className="h-2 w-10 bg-purple-400/50 rounded-full" />
                  <div className="h-8 bg-purple-400/10 rounded-lg" />
                </div>
              </div>
              <div className="absolute font-mono text-[10px] text-fuchsia-300 font-bold tracking-widest uppercase">
                [FIGMA // UI]
              </div>
            </div>
          ),
        };
      }
      if (cat.type === 'app') {
        return {
          id: `pillar-${cat.type}`,
          type: 'pillar',
          skillCategory: 'app',
          title: cat.title[lang],
          subtitle: cat.subtitle[lang],
          description: cat.description[lang],
          skills: cat.skills,
          accentColor: '#10b981',
          glowColor: 'rgba(16, 185, 129, 0.4)',
          bgGradient: 'from-emerald-950 via-zinc-950 to-black',
          badgeText: `0${idx + 1} // PÔLE IA & APP`,
          icon: '⚡',
          visualGraphic: (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-35 pointer-events-none">
              <div className="h-36 w-36 border border-emerald-500/40 rotate-45 animate-pulse" />
              <div className="absolute h-24 w-24 border border-dashed border-emerald-400/50 rotate-12" />
              <div className="absolute font-mono text-[10px] text-emerald-400 font-bold tracking-widest uppercase">
                {'{ AGENTIC }'}
              </div>
            </div>
          ),
        };
      }
      // music
      return {
        id: `pillar-${cat.type}`,
        type: 'pillar',
        skillCategory: 'music',
        title: cat.title[lang],
        subtitle: cat.subtitle[lang],
        description: cat.description[lang],
        skills: cat.skills,
        accentColor: '#ec4899',
        glowColor: 'rgba(236, 72, 153, 0.4)',
        bgGradient: 'from-rose-950 via-zinc-950 to-black',
        badgeText: `0${idx + 1} // PÔLE AUDIO`,
        icon: '♫',
        visualGraphic: (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-40 pointer-events-none">
            <div className="flex items-center gap-1.5 h-16">
              <div className="w-1.5 h-8 bg-rose-400 rounded-full animate-pulse" />
              <div className="w-1.5 h-14 bg-pink-400 rounded-full animate-pulse [animation-delay:150ms]" />
              <div className="w-1.5 h-10 bg-rose-300 rounded-full animate-pulse [animation-delay:300ms]" />
              <div className="w-1.5 h-16 bg-pink-500 rounded-full animate-pulse [animation-delay:450ms]" />
              <div className="w-1.5 h-12 bg-rose-400 rounded-full animate-pulse [animation-delay:200ms]" />
              <div className="w-1.5 h-6 bg-pink-300 rounded-full animate-pulse [animation-delay:350ms]" />
            </div>
          </div>
        ),
      };
    });

    const stacks: SkillItem[] = (stackCategoriesData[lang] || []).map((stack, idx) => {
      const associatedSkill: SkillType =
        stack.id === 'frontend-creative'
          ? 'frontend'
          : stack.id === 'ai-agentic'
          ? 'app'
          : stack.id === 'design-prototyping'
          ? 'design'
          : 'frontend';

      return {
        id: `stack-${stack.id}`,
        type: 'stack',
        skillCategory: associatedSkill,
        title: stack.name,
        subtitle: stack.tag,
        description: stack.description,
        skills: stack.skills,
        accentColor: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.35)',
        bgGradient: 'from-cyan-950 via-zinc-950 to-black',
        badgeText: `STACK 0${idx + 1}`,
        icon: '⚙',
        visualGraphic: (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-30 pointer-events-none">
            <div className="w-24 h-24 border border-cyan-500/30 rounded-2xl flex items-center justify-center rotate-6">
              <div className="font-mono text-[9px] text-cyan-300 text-center tracking-wider">
                [CI/CD // DEV]
              </div>
            </div>
          </div>
        ),
      };
    });

    return [...pillars, ...stacks];
  }, [lang]);

  // Filter items based on activeTab
  const filteredItems = useMemo(() => {
    if (activeTab === 'pillars') return rawItems.filter((it) => it.type === 'pillar');
    if (activeTab === 'stack') return rawItems.filter((it) => it.type === 'stack');
    return rawItems;
  }, [rawItems, activeTab]);

  const count = filteredItems.length;
  const COPIES = 3;
  const singleSetWidth = count * itemStride;

  const items = useMemo(() => {
    if (count === 0) return [];
    const repeated: Array<{ item: SkillItem; copyIndex: number; flatIndex: number }> = [];
    for (let c = 0; c < COPIES; c++) {
      filteredItems.forEach((it, i) => {
        repeated.push({
          item: it,
          copyIndex: c,
          flatIndex: c * count + i,
        });
      });
    }
    return repeated;
  }, [filteredItems, count]);

  // Reset scroll position to the middle set on items change
  useEffect(() => {
    if (singleSetWidth > 0) {
      posRef.current = singleSetWidth;
      setHoveredFlatIndex(null);
    }
  }, [singleSetWidth]);

  // Drift loop with subpixel accuracy
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isDragging && singleSetWidth > 0) {
        if (Math.abs(velocityRef.current) > 0.5) {
          posRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(0.88, dt * 60);
        } else {
          velocityRef.current = 0;
          if (!isPointerOver && hoveredFlatIndex === null) {
            const driftSpeed = 30; // px/s
            posRef.current += driftSpeed * dt;
          }
        }

        if (posRef.current >= singleSetWidth * 2) {
          posRef.current -= singleSetWidth;
        } else if (posRef.current < singleSetWidth) {
          posRef.current += singleSetWidth;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDragging, isPointerOver, hoveredFlatIndex, singleSetWidth]);

  // Drag & Pointer gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocity: 0,
    };
    velocityRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = Math.max((now - dragStartRef.current.lastTime) / 1000, 0.001);
    const dx = e.clientX - dragStartRef.current.lastX;

    posRef.current = dragStartRef.current.startPos - (e.clientX - dragStartRef.current.startX);

    dragStartRef.current.velocity = -dx / dt;
    dragStartRef.current.lastX = e.clientX;
    dragStartRef.current.lastTime = now;

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const v = dragStartRef.current.velocity;
    velocityRef.current = Math.max(-1400, Math.min(1400, v));
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY * 0.7;
    posRef.current += delta;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
    }
  };

  const scrollStep = (direction: 'left' | 'right') => {
    velocityRef.current = direction === 'left' ? -600 : 600;
  };

  const activeItem = useMemo(() => {
    if (hoveredFlatIndex === null) return null;
    return items.find((it) => it.flatIndex === hoveredFlatIndex)?.item || null;
  }, [hoveredFlatIndex, items]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-visible py-4"
      onPointerEnter={() => setIsPointerOver(true)}
      onPointerLeave={() => {
        setIsPointerOver(false);
        setHoveredFlatIndex(null);
        onLeaveItem?.();
      }}
      onWheel={handleWheel}
    >
      {/* Top Filter Buttons for Skills & Stack */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 mb-4">
        {/* Toggle Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-zinc-950 text-white shadow-md scale-105 dark:bg-white dark:text-zinc-950'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {lang === 'fr' ? 'TOUT AFFICHER' : 'SHOW ALL'} ({rawItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pillars')}
            className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pillars'
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {lang === 'fr' ? 'PÔLES D’EXPERTISE' : 'CORE PILLARS'} (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stack')}
            className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stack'
                ? 'bg-cyan-600 text-white shadow-md scale-105'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {lang === 'fr' ? 'STACK TECHNIQUE' : 'TECH STACK'} (4)
          </button>
        </div>

        {/* Chevrons controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollStep('left')}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollStep('right')}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Lollipop Scroller Viewport */}
      <div
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing touch-none py-8"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className="flex items-center will-change-transform"
          style={{
            gap: `${gap}px`,
            width: `${items.length * itemStride}px`,
          }}
        >
          {items.map((entry) => {
            const item = entry.item;
            const isHovered = hoveredFlatIndex === entry.flatIndex;
            const hasAnyHover = hoveredFlatIndex !== null;

            // Spread offset calculation for neighbours
            let spreadOffset = 0;
            if (hoveredFlatIndex !== null && !isHovered) {
              const diff = entry.flatIndex - hoveredFlatIndex;
              if (diff > 0) {
                spreadOffset = Math.max(0, 90 - (diff - 1) * 25);
              } else if (diff < 0) {
                spreadOffset = -Math.max(0, 90 - (Math.abs(diff) - 1) * 25);
              }
            }

            return (
              <div
                key={`${item.id}-${entry.copyIndex}-${entry.flatIndex}`}
                className="relative flex-shrink-0 transition-all duration-300 ease-out"
                style={{
                  width: `${pillWidth}px`,
                  height: `${pillHeight}px`,
                  transform: `translateX(${spreadOffset}px)`,
                  zIndex: isHovered ? 40 : 10,
                }}
                onPointerEnter={() => {
                  setHoveredFlatIndex(entry.flatIndex);
                  onHoverItem?.(item.title);
                }}
              >
                {/* The Capsule Container */}
                <motion.div
                  layout
                  className={`relative w-full h-full overflow-hidden transition-all duration-300 ease-out cursor-pointer bg-gradient-to-b ${item.bgGradient} ${
                    isHovered
                      ? 'rounded-3xl shadow-2xl ring-2 shadow-cyan-500/20'
                      : 'rounded-full shadow-md hover:shadow-xl border border-white/10'
                  } ${
                    hasAnyHover && !isHovered ? 'opacity-40 scale-95 blur-[0.3px]' : 'opacity-100 scale-100'
                  }`}
                  style={{
                    transformOrigin: 'center center',
                    transform: isHovered ? 'scale(1.22)' : 'scale(1)',
                    borderColor: isHovered ? item.accentColor : undefined,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.skillCategory) {
                      onSelectSkill(item.skillCategory);
                    }
                  }}
                >
                  {/* Background graphic canvas */}
                  {item.visualGraphic}

                  {/* Ambient Glow */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-45"
                    style={{
                      background: `radial-gradient(circle at 50% 35%, ${item.glowColor}, transparent 75%)`,
                    }}
                  />

                  {/* Top Badge */}
                  <div className="absolute top-4 inset-x-0 flex justify-center px-2 pointer-events-none">
                    <span className="rounded-full bg-white/10 backdrop-blur-md px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-white border border-white/15 drop-shadow-sm truncate max-w-full">
                      {item.badgeText}
                    </span>
                  </div>

                  {/* Center Icon Graphic */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className="text-2xl font-bold transition-transform duration-500"
                      style={{ color: item.accentColor, filter: `drop-shadow(0 0 12px ${item.glowColor})` }}
                    >
                      {item.icon}
                    </span>
                  </div>

                  {/* Pill idle title */}
                  {!isHovered && (
                    <div className="absolute inset-x-0 bottom-4 px-3 text-center pointer-events-none">
                      <span className="inline-block text-[11px] font-mono font-semibold tracking-wider text-white/90 drop-shadow-md truncate max-w-full">
                        {item.title}
                      </span>
                    </div>
                  )}

                  {/* Quick Expand Badge on Hover */}
                  {isHovered && (
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/95 text-zinc-950 backdrop-blur-md shadow-md text-xs font-bold">
                        ↗
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Lollipop Caption Drawer for Skills & Stacks */}
      <div className="w-full max-w-4xl mx-auto px-4 min-h-[140px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeItem ? (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="w-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              {/* Left Details */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase border"
                    style={{
                      backgroundColor: `${activeItem.accentColor}18`,
                      borderColor: `${activeItem.accentColor}40`,
                      color: activeItem.accentColor,
                    }}
                  >
                    {activeItem.badgeText}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                    {activeItem.subtitle}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
                    {activeItem.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 max-w-2xl leading-relaxed">
                    {activeItem.description}
                  </p>
                </div>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeItem.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Action Button */}
              {activeItem.skillCategory && (
                <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => onSelectSkill(activeItem.skillCategory!)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>
                      {lang === 'fr'
                        ? `VOIR LES PROJETS ${activeItem.skillCategory.toUpperCase()}`
                        : `VIEW ${activeItem.skillCategory.toUpperCase()} PROJECTS`}
                    </span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="skills-idle-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-2"
            >
              <span>←</span>
              <span>
                {lang === 'fr'
                  ? 'Survolez une capsule de compétence ou stack pour inspecter les technologies et filtrer les projets'
                  : 'Hover a skill or stack capsule to inspect tools and filter associated projects'}
              </span>
              <span>→</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
