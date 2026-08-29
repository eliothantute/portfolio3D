import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Project, Language } from '../types';

interface VelocityCarouselProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export const VelocityCarousel: React.FC<VelocityCarouselProps> = ({
  projects,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(() => Math.floor(projects.length / 2));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

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
    if (isMobile) return clamp(containerWidth - 64, 280, 360);
    if (isTablet) return clamp(containerWidth * 0.46, 340, 420);
    return clamp(containerWidth * 0.38, 420, 520);
  }, [containerWidth, isMobile, isTablet]);

  const cardHeight = cardWidth * 1.18;
  const spacing = isMobile ? cardWidth * 0.88 : cardWidth * 0.58;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(clamp(index, 0, projects.length - 1));
    },
    [projects.length]
  );

  const previous = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? projects.length - 1 : current - 1));
  }, [projects.length]);

  const next = useCallback(() => {
    setActiveIndex((current) => (current === projects.length - 1 ? 0 : current + 1));
  }, [projects.length]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = isMobile ? 30 : 50;
      if (info.offset.x > threshold) {
        previous();
      } else if (info.offset.x < -threshold) {
        next();
      }
    },
    [isMobile, previous, next]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        previous();
      } else if (e.key === 'ArrowRight') {
        next();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previous, next]);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col items-center justify-center overflow-hidden py-8 select-none"
      style={{ minHeight: cardHeight + 140 }}
    >
      {/* Cards Slider Stage */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="relative flex h-full w-full items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ height: cardHeight, touchAction: 'pan-y' }}
      >
        {projects.map((project, index) => {
          const isActive = index === activeIndex;
          const distance = index - activeIndex;
          const absDistance = Math.abs(distance);
          const x = distance * spacing;
          const scale = isActive ? 1 : hoveredIndex === index ? 0.9 : 0.84;
          const opacity = absDistance > 2 ? 0.35 : absDistance === 2 ? 0.6 : 1;

          return (
            <motion.div
              key={`${project.id}-${index}`}
              onClick={() => {
                if (!isActive) {
                  goTo(index);
                }
              }}
              onMouseEnter={() => {
                if (!isActive) setHoveredIndex(index);
                onHoverItem?.(project.title.toUpperCase());
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                onLeaveItem?.();
              }}
              animate={{
                x,
                scale,
                opacity,
                zIndex: isActive ? 50 : 50 - absDistance,
              }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: 'absolute',
                width: cardWidth,
                height: cardHeight,
                borderRadius: isMobile ? 28 : 36,
                transformOrigin: 'center center',
              }}
              className={`group overflow-hidden bg-zinc-900 border transition-shadow duration-500 ${
                isActive
                  ? 'border-white/90 shadow-[0_28px_80px_rgba(0,0,0,0.2),0_10px_28px_rgba(0,0,0,0.12)] cursor-default'
                  : 'border-zinc-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] cursor-pointer'
              }`}
            >
              {/* Project Image Cover */}
              <img
                src={project.image}
                alt={project.title}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />

              {/* Dynamic Gradient Dark Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 ${
                  isActive ? 'opacity-85' : 'opacity-60 group-hover:opacity-45'
                }`}
              />

              {/* Category Pill Top */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 flex items-center gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-900 shadow-sm backdrop-blur-md">
                  {project.category}
                </span>
                <span className="rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] font-semibold text-white/80 backdrop-blur-md">
                  {project.year}
                </span>
              </div>

              {/* Active Card Content Flow */}
              <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-7 text-white text-left">
                {/* Headline & Description */}
                <div>
                  <h3 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {project.title}
                  </h3>
                  <p
                    className={`mt-2 text-xs leading-relaxed text-zinc-200 sm:text-sm line-clamp-2 transition-opacity duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-80'
                    }`}
                  >
                    {project.subtitle}
                  </p>
                </div>

                {/* Tech Stack Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.slice(0, 3).map((tech, sIdx) => (
                    <span
                      key={sIdx}
                      className="rounded-lg bg-white/15 px-2 py-0.5 font-mono text-[10px] font-medium text-white backdrop-blur-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action CTA Trigger */}
                <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-zinc-950 shadow-md transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95"
                  >
                    <span>{lang === 'fr' ? 'Explorer le projet' : 'Explore Project'}</span>
                    <span>↗</span>
                  </button>

                  <span className="font-mono text-xs text-white/70">
                    {project.status}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navigation Controls: Arrows & Expanding Pagination Dots */}
      <div className="mt-8 flex items-center justify-center gap-6 z-20">
        {/* Previous Button */}
        <button
          type="button"
          onClick={previous}
          aria-label="Previous project"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white"
        >
          ←
        </button>

        {/* Indicator Pagination Pills */}
        <div className="flex items-center gap-2">
          {projects.map((_, index) => {
            const isDotActive = index === activeIndex;
            return (
              <button
                key={`dot-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                style={{
                  width: isDotActive ? 26 : 8,
                  height: 8,
                  borderRadius: 9999,
                  backgroundColor: isDotActive ? '#09090b' : '#d4d4d8',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={next}
          aria-label="Next project"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white"
        >
          →
        </button>
      </div>
    </div>
  );
};
