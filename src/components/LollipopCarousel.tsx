import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Language } from '../types';

interface LollipopCarouselProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const SIMPLE_DESCRIPTIONS: Record<string, { fr: string; en: string }> = {
  'atelier-berger': {
    fr: 'Globe 3D interactif pour explorer des réalisations de prestige à travers le monde.',
    en: 'Interactive 3D globe to explore prestige architecture & jewelry worldwide.',
  },
  'elora': {
    fr: 'Site vitrine moderne conçu avec fidélité d’après une maquette Figma soignée.',
    en: 'Modern showcase website faithfully built from a detailed Figma design.',
  },
  'nari-os': {
    fr: 'Landing page spatiale et sobre pour un agent vocal IA souverain français.',
    en: 'Sleek, sovereign voice AI landing page built with spatial minimalism.',
  },
  'ping-paris': {
    fr: 'Carte interactive PWA pour localiser les tables de ping-pong gratuites à Paris avec météo.',
    en: 'Interactive PWA city map finding free outdoor ping-pong spots in Paris with live weather.',
  },
  'hazi-whatsapp': {
    fr: 'Page de présentation pour une application intelligente sur ordinateur.',
    en: 'Showcase landing page for a modern desktop AI application.',
  },
  'aum-paris': {
    fr: 'Boutique en ligne épurée et élégante pour une marque de maroquinerie de luxe.',
    en: 'Minimalist, luxury e-commerce experience for high-end leather goods.',
  },
  'le-zinc': {
    fr: 'Site vitrine mobile-first pour bistrot parisien avec menu sans PDF et horaires dynamiques.',
    en: 'Mobile-first Parisian bistro showcase with zero-PDF menu and live opening hours.',
  },
  'centre-neuro': {
    fr: 'Modernisation de l’expérience web médicale pour une navigation claire et fluide.',
    en: 'Medical center web modernisation for smooth, intuitive patient guidance.',
  },
  'souvenir-francais': {
    fr: 'Site institutionnel clair, accessible et adapté à tous les formats d’écrans.',
    en: 'Clear, accessible institutional platform designed for all screen formats.',
  },
};

export const LollipopCarousel: React.FC<LollipopCarouselProps> = ({
  projects,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Hovered item identifier (flatIndex)
  const [hoveredFlatIndex, setHoveredFlatIndex] = useState<number | null>(null);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Position accumulator for subpixel drift
  const posRef = useRef(0);
  const dragStartRef = useRef<{ startX: number; startPos: number; lastX: number; lastTime: number; velocity: number }>({
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const hasMovedRef = useRef(false);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Dimensions of the lollipop capsules (original sleek lollipop proportions)
  const pillWidth = 160;
  const pillHeight = 250;
  const gap = 16;
  const itemStride = pillWidth + gap;

  // Repeat projects 3 times so the ribbon loops infinitely
  const COPIES = 3;
  const count = projects.length;
  const singleSetWidth = count * itemStride;

  const items = useMemo(() => {
    if (count === 0) return [];
    const repeated: Array<{ project: Project; copyIndex: number; flatIndex: number }> = [];
    for (let c = 0; c < COPIES; c++) {
      projects.forEach((project, i) => {
        repeated.push({
          project,
          copyIndex: c,
          flatIndex: c * count + i,
        });
      });
    }
    return repeated;
  }, [projects, count]);

  // Initialize position in the middle copy
  useEffect(() => {
    if (singleSetWidth > 0) {
      posRef.current = singleSetWidth;
    }
  }, [singleSetWidth]);

  // Continuous drift animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isDragging && singleSetWidth > 0) {
        // Friction decay for inertia throw
        if (Math.abs(velocityRef.current) > 0.5) {
          posRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(0.88, dt * 60);
        } else {
          velocityRef.current = 0;
          // Steady ambient drift when not hovering an item
          if (!isPointerOver && hoveredFlatIndex === null) {
            const driftSpeed = 34; // px per second
            posRef.current += driftSpeed * dt;
          }
        }

        // Infinite loop wrapping
        if (posRef.current >= singleSetWidth * 2) {
          posRef.current -= singleSetWidth;
        } else if (posRef.current < singleSetWidth) {
          posRef.current += singleSetWidth;
        }

        // Apply transform to the track directly for 60fps performance
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

  // Pointer & Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasMovedRef.current = false;
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

    if (Math.abs(e.clientX - dragStartRef.current.startX) > 6) {
      hasMovedRef.current = true;
    }

    posRef.current = dragStartRef.current.startPos - (e.clientX - dragStartRef.current.startX);

    // Track fling velocity
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
    // Apply inertia velocity
    const v = dragStartRef.current.velocity;
    velocityRef.current = Math.max(-1400, Math.min(1400, v));
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Wheel horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY * 0.7;
    posRef.current += delta;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
    }
  };

  // Nav chevrons
  const scrollStep = (direction: 'left' | 'right') => {
    velocityRef.current = direction === 'left' ? -600 : 600;
  };

  // Currently hovered project
  const activeItem = useMemo(() => {
    if (hoveredFlatIndex === null) return null;
    return items.find((it) => it.flatIndex === hoveredFlatIndex)?.project || null;
  }, [hoveredFlatIndex, items]);

  if (projects.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-500 font-mono text-sm">
        {lang === 'fr' ? 'Aucun projet dans cette catégorie.' : 'No projects found in this category.'}
      </div>
    );
  }

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
      {/* Commandes chevrons discrètes à droite */}
      <div className="flex items-center justify-end px-4 sm:px-8 mb-2">
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
        {/* Continuous track */}
        <div
          ref={trackRef}
          className="flex items-center will-change-transform"
          style={{
            gap: `${gap}px`,
            width: `${items.length * itemStride}px`,
          }}
        >
          {items.map((item) => {
            const isHovered = hoveredFlatIndex === item.flatIndex;
            const hasAnyHover = hoveredFlatIndex !== null;

            // Framer Lollipop neighbor parting calculation
            let spreadOffset = 0;
            if (hoveredFlatIndex !== null && !isHovered) {
              const diff = item.flatIndex - hoveredFlatIndex;
              if (diff > 0) {
                spreadOffset = Math.max(0, 90 - (diff - 1) * 25);
              } else if (diff < 0) {
                spreadOffset = -Math.max(0, 90 - (Math.abs(diff) - 1) * 25);
              }
            }

            return (
              <div
                key={`${item.project.id}-${item.copyIndex}-${item.flatIndex}`}
                className="relative flex-shrink-0 transition-all duration-300 ease-out"
                style={{
                  width: `${pillWidth}px`,
                  height: `${pillHeight}px`,
                  transform: `translateX(${spreadOffset}px)`,
                  zIndex: isHovered ? 40 : 10,
                }}
                onPointerEnter={() => {
                  setHoveredFlatIndex(item.flatIndex);
                  onHoverItem?.(item.project.title);
                }}
              >
                {/* The Capsule / Lollipop Media Container */}
                <motion.div
                  layout
                  className={`relative w-full h-full overflow-hidden transition-all duration-300 ease-out cursor-pointer ${
                    isHovered
                      ? 'rounded-3xl shadow-2xl ring-2 ring-blue-500 dark:ring-blue-400 shadow-blue-500/30'
                      : 'rounded-full shadow-md hover:shadow-xl border border-zinc-200/60 dark:border-zinc-800/80'
                  } ${
                    hasAnyHover && !isHovered ? 'opacity-40 scale-95 blur-[0.3px]' : 'opacity-100 scale-100'
                  }`}
                  style={{
                    transformOrigin: 'center center',
                    transform: isHovered ? 'scale(1.22)' : 'scale(1)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasMovedRef.current) return;
                    onSelectProject(item.project);
                  }}
                  title={lang === 'fr' ? `Voir les détails de ${item.project.title}` : `View ${item.project.title} details`}
                >
                  {/* Media Image */}
                  <img
                    src={item.project.image}
                    alt={item.project.title}
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-700 ease-out hover:scale-105"
                    loading="lazy"
                  />

                  {/* Subtle gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                  {/* Pill idle label */}
                  {!isHovered && (
                    <div className="absolute inset-x-0 bottom-4 px-3 text-center pointer-events-none">
                      <span className="inline-block text-[11px] font-mono font-semibold tracking-wider text-white drop-shadow-md truncate max-w-full">
                        {item.project.title}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Lollipop Caption Drawer : Design d'avant, sans blabla ni spécifications dans tous les sens */}
      <div className="w-full max-w-4xl mx-auto px-4 min-h-[120px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeItem ? (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="w-full bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              {/* Explication claire et simple */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    {activeItem.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {activeItem.year}
                  </span>
                  {activeItem.status && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40">
                      ● {activeItem.status}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
                  {activeItem.title}
                </h3>

                {/* Explication simple et directe (zéro blabla technique ou spécifications superflues) */}
                <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                  {SIMPLE_DESCRIPTIONS[activeItem.id]?.[lang] || activeItem.subtitle || activeItem.description}
                </p>
              </div>

              {/* Bouton pour accéder aux détails + bouton URL direct */}
              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onSelectProject(activeItem)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>{lang === 'fr' ? 'DÉTAILS DU PROJET' : 'VIEW DETAILS'}</span>
                  <span>→</span>
                </button>

                {activeItem.liveUrl && (
                  <a
                    href={activeItem.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all shadow-sm cursor-pointer"
                    title={lang === 'fr' ? 'Ouvrir le site en direct ↗' : 'Open live website ↗'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-2"
            >
              <span>←</span>
              <span>
                {lang === 'fr'
                  ? 'Glissez ou survolez pour explorer • Cliquez sur une image pour afficher les détails'
                  : 'Drag or hover to explore • Click an image to view details'}
              </span>
              <span>→</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
