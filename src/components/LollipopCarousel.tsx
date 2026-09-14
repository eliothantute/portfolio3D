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

                  {/* Gradient sombre discret en bas pour détacher le titre */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                  {/* Titre minimaliste sur l'image */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between pointer-events-none">
                    <div className="min-w-0 pr-2">
                      <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight drop-shadow truncate">
                        {item.project.title}
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-300 drop-shadow">
                        {item.project.category}
                      </span>
                    </div>

                    <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-white backdrop-blur-md shadow-sm text-xs font-bold transition-transform group-hover:scale-110">
                      ↗
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
