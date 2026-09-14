import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project, Language } from '../types';

interface LollipopCarouselProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const LollipopCarousel: React.FC<LollipopCarouselProps> = ({
  projects,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [hoveredFlatIndex, setHoveredFlatIndex] = useState<number | null>(null);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Position accumulator for smooth drift
  const posRef = useRef(0);
  const dragStartRef = useRef<{
    startX: number;
    startPos: number;
    lastX: number;
    lastTime: number;
    velocity: number;
  }>({
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const hasMovedRef = useRef(false);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Balanced landscape proportions for project cards (readable previews, no ugly cropping)
  const cardWidth = 320;
  const cardHeight = 200;
  const gap = 18;
  const itemStride = cardWidth + gap;

  // Repeat projects 3 times so the carousel loops infinitely
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

  // Initialize position in the middle set
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
        // Friction decay for flick / inertia
        if (Math.abs(velocityRef.current) > 0.5) {
          posRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(0.88, dt * 60);
        } else {
          velocityRef.current = 0;
          // Ambient slow drift when not hovering an item
          if (!isPointerOver && hoveredFlatIndex === null) {
            const driftSpeed = 32; // px per second
            posRef.current += driftSpeed * dt;
          }
        }

        // Infinite loop wrapping
        if (posRef.current >= singleSetWidth * 2) {
          posRef.current -= singleSetWidth;
        } else if (posRef.current < singleSetWidth) {
          posRef.current += singleSetWidth;
        }

        // Direct hardware-accelerated transform
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

  // Chevrons navigation controls
  const scrollStep = (direction: 'left' | 'right') => {
    velocityRef.current = direction === 'left' ? -650 : 650;
  };

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 font-mono text-xs">
        {lang === 'fr' ? 'Aucun projet dans cette catégorie.' : 'No projects found in this category.'}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-visible py-2"
      onPointerEnter={() => setIsPointerOver(true)}
      onPointerLeave={() => {
        setIsPointerOver(false);
        setHoveredFlatIndex(null);
        onLeaveItem?.();
      }}
      onWheel={handleWheel}
    >
      {/* Top minimal bar : compteur discret et flèches de navigation */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <span>{projects.length} {lang === 'fr' ? 'projets' : 'projects'}</span>
        </div>

        {/* Flèches de défilement discrètes */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollStep('left')}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollStep('right')}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>

      {/* Main Track Viewport */}
      <div
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing touch-none py-2"
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
          {items.map((item) => {
            const isHovered = hoveredFlatIndex === item.flatIndex;

            return (
              <div
                key={`${item.project.id}-${item.copyIndex}-${item.flatIndex}`}
                className="relative flex-shrink-0 group"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                }}
                onPointerEnter={() => {
                  setHoveredFlatIndex(item.flatIndex);
                  onHoverItem?.(item.project.title);
                }}
              >
                {/* Image du projet cliquable : ouvre directement la carte projet */}
                <div
                  className={`relative w-full h-full overflow-hidden rounded-2xl border transition-all duration-300 ease-out cursor-pointer ${
                    isHovered
                      ? 'border-zinc-900 dark:border-zinc-100 shadow-xl scale-[1.03]'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-md'
                  } bg-zinc-100 dark:bg-zinc-900`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasMovedRef.current) return;
                    onSelectProject(item.project);
                  }}
                  title={lang === 'fr' ? `Voir la carte ${item.project.title}` : `View ${item.project.title} card`}
                >
                  <img
                    src={item.project.image}
                    alt={item.project.title}
                    className="w-full h-full object-cover object-top pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient sombre discret pour détacher les textes et actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

                  {/* Top Bar : Badge Catégorie à gauche, Liens Directs à droite */}
                  <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 text-white/90 border border-white/10 backdrop-blur-md text-[10px] font-mono uppercase font-semibold pointer-events-none">
                      {item.project.category}
                    </span>

                    {/* Liens cliquables directs : Voir le site et GitHub */}
                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      {item.project.liveUrl && (
                        <a
                          href={item.project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={() => onHoverItem?.('VISITER')}
                          onMouseLeave={onLeaveItem}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-zinc-950 shadow-md text-[11px] font-mono font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          title={lang === 'fr' ? 'Ouvrir le site en direct ↗' : 'Open live site ↗'}
                        >
                          <span>{lang === 'fr' ? 'Visiter' : 'Live'}</span>
                          <span>↗</span>
                        </a>
                      )}

                      {item.project.githubUrl && (
                        <a
                          href={item.project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={() => onHoverItem?.('GITHUB')}
                          onMouseLeave={onLeaveItem}
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          title="GitHub ↗"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bas de carte : Titre & Puce fiche détaillée */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between pointer-events-none z-20">
                    <div className="min-w-0 pr-2">
                      <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight drop-shadow truncate">
                        {item.project.title}
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-300 drop-shadow truncate block">
                        {item.project.subtitle || item.project.category}
                      </span>
                    </div>

                    <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md text-[10px] font-mono font-medium">
                      <span>{lang === 'fr' ? 'Fiche' : 'Details'}</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
