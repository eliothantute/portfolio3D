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
  const [isUserInteracting, setIsUserInteracting] = useState(false);
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

  // Responsive Card Dimensions
  const cardSize = useMemo(() => {
    if (isMobile) return clamp(containerWidth * 0.78, 260, 320);
    if (isTablet) return clamp(containerWidth * 0.4, 320, 360);
    return clamp(containerWidth * 0.3, 350, 400);
  }, [containerWidth, isMobile, isTablet]);

  // Generous Spacing between cards (no heavy cramped overlap)
  const spacing = useMemo(() => {
    if (isMobile) return cardSize * 1.06;
    if (isTablet) return cardSize * 1.12;
    return cardSize * 1.18;
  }, [cardSize, isMobile, isTablet]);

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

  // Auto-motion interval when user is not interacting
  useEffect(() => {
    if (isUserInteracting || hoveredIndex !== null) return;

    const autoMotionTimer = setInterval(() => {
      next();
    }, 3600);

    return () => clearInterval(autoMotionTimer);
  }, [isUserInteracting, hoveredIndex, next]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsUserInteracting(false);
      const threshold = isMobile ? 36 : 56;
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
      className="relative flex w-full flex-col items-center justify-center overflow-hidden py-14 select-none"
      style={{ minHeight: cardSize + 160 }}
      onMouseEnter={() => setIsUserInteracting(true)}
      onMouseLeave={() => setIsUserInteracting(false)}
    >
      {/* Cards Slider Stage with Framer Drag Physics */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragStart={() => setIsUserInteracting(true)}
        onDragEnd={handleDragEnd}
        className="relative flex h-full w-full items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ height: cardSize, touchAction: 'pan-y' }}
      >
        {projects.map((project, index) => {
          const isActive = index === activeIndex;
          const distance = index - activeIndex;
          const absDistance = Math.abs(distance);
          const x = distance * spacing;
          const scale = isActive ? 1 : hoveredIndex === index ? 0.94 : 0.88;
          const opacity = absDistance > 2 ? 0.45 : absDistance === 2 ? 0.75 : 1;

          // Organic vertical floating offset for continuous motion
          const floatY = isActive ? 0 : Math.sin(index * 1.4) * 6;

          return (
            <motion.div
              key={`${project.id}-${index}`}
              role={isActive ? 'group' : 'button'}
              tabIndex={isActive ? -1 : 0}
              aria-label={isActive ? project.title : `Slide ${index + 1}`}
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
                y: floatY,
                scale,
                opacity,
                zIndex: isActive ? 50 : 50 - absDistance,
              }}
              transition={{
                duration: hoveredIndex === index ? 0.3 : 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: cardSize,
                height: cardSize,
                marginLeft: -cardSize / 2,
                marginTop: -cardSize / 2,
                transformOrigin: 'center center',
                borderRadius: 40,
                border: `${isActive ? 9 : hoveredIndex === index ? 4 : 2.5}px solid ${
                  isActive ? '#ffffff' : hoveredIndex === index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'
                }`,
                boxShadow: isActive
                  ? '0 32px 90px rgba(0,0,0,0.32), 0 12px 32px rgba(0,0,0,0.18)'
                  : hoveredIndex === index
                  ? '0 18px 45px rgba(0,0,0,0.22)'
                  : '0 8px 24px rgba(0,0,0,0.1)',
              }}
              className="group overflow-hidden bg-zinc-800 cursor-pointer outline-none transition-shadow duration-500"
            >
              {/* Project Background Image */}
              <img
                src={project.image}
                alt={project.title}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />

              {/* Dark Overlay */}
              <div
                style={{
                  backgroundColor: '#000000',
                  opacity: isActive ? 0.42 : hoveredIndex === index ? 0.32 : 0.52,
                  transition: 'opacity 0.5s ease',
                }}
                className="absolute inset-0"
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

              {/* Active Card Content (Headline, Subtext, Pill Button) */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                  className="relative z-10 flex h-full w-full flex-col items-center justify-end p-6 sm:p-8 text-center text-white"
                >
                  <div className="flex flex-col items-center gap-2 max-w-full">
                    <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl leading-tight">
                      {project.title}
                    </h3>
                    <p className="line-clamp-2 max-w-[90%] text-xs sm:text-sm font-normal text-white/90 leading-relaxed">
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Centered White Pill Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-7 py-2.5 font-sans text-xs sm:text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{lang === 'fr' ? 'Explorer' : 'Learn More'}</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Indicator Pagination Dots & Controls */}
      {projects.length > 1 && (
        <div className="mt-14 flex items-center justify-center gap-5 z-20">
          <button
            type="button"
            onClick={previous}
            aria-label="Previous project"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white"
          >
            ←
          </button>

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
                    width: isDotActive ? 22 : 7,
                    height: 7,
                    borderRadius: 9999,
                    backgroundColor: '#111111',
                    opacity: isDotActive ? 1 : 0.28,
                    transition: 'all 0.4s ease',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next project"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};
