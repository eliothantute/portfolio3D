import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from 'framer-motion';
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

  // Larger Grand 3D Card Dimensions
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

  // Hover-driven scroll across the stage: tracks horizontal mouse ratio to smoothly glide to corresponding card
  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || isMobile) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      const relativeY = (e.clientY - rect.top) / rect.height;

      mouseX.set(relativeX);
      mouseY.set(relativeY);

      // Map horizontal cursor position to target card index across the ribbon
      const targetIndex = Math.floor(relativeX * projects.length);
      const safeTarget = clamp(targetIndex, 0, projects.length - 1);

      if (safeTarget !== activeIndex && Math.abs(relativeX - 0.5) > 0.12) {
        setActiveIndex(safeTarget);
      }
    },
    [isMobile, mouseX, mouseY, projects.length, activeIndex]
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

  // Wheel horizontal navigation
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (Math.abs(e.deltaX) > 35) {
        if (e.deltaX > 0) next();
        else previous();
      }
    },
    [next, previous]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      onWheel={handleWheel}
      className="relative flex w-full flex-col items-center justify-center overflow-hidden py-14 select-none [perspective:1600px]"
      style={{ minHeight: cardHeight + 160 }}
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
        {projects.map((project, index) => {
          const isActive = index === activeIndex;
          const distance = index - activeIndex;
          const absDistance = Math.abs(distance);
          const x = distance * spacing;

          // 3D perspective geometry: non-active cards angle inwards like an IMAX curved gallery
          const rotateYAngle = distance * -12;
          const zDepth = isActive ? 0 : -absDistance * 110;
          const scale = isActive ? 1 : hoveredIndex === index ? 0.94 : 0.88;
          const opacity = absDistance > 2 ? 0.35 : absDistance === 2 ? 0.65 : 1;

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
                if (!isActive) {
                  goTo(index);
                  setHoveredIndex(index);
                }
                onHoverItem?.(project.title.toUpperCase());
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                onLeaveItem?.();
              }}
              animate={{
                x,
                z: zDepth,
                rotateY: isActive ? 0 : rotateYAngle,
                scale,
                opacity,
                zIndex: isActive ? 50 : 50 - absDistance,
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: cardWidth,
                height: cardHeight,
                marginLeft: -cardWidth / 2,
                marginTop: -cardHeight / 2,
                transformOrigin: 'center center',
                borderRadius: 40,
                border: `${isActive ? 9 : hoveredIndex === index ? 4 : 2.5}px solid ${
                  isActive ? '#ffffff' : hoveredIndex === index ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)'
                }`,
                boxShadow: isActive
                  ? '0 32px 90px rgba(0,0,0,0.36), 0 12px 32px rgba(0,0,0,0.22)'
                  : hoveredIndex === index
                  ? '0 20px 50px rgba(0,0,0,0.24)'
                  : '0 8px 25px rgba(0,0,0,0.12)',
              }}
              className="group overflow-hidden bg-zinc-900 cursor-pointer outline-none [transform-style:preserve-3d] transition-shadow duration-500"
            >
              {/* Active Gyroscopic 3D Tilt Wrapper */}
              <motion.div
                style={{
                  rotateX: isActive ? activeRotateX : 0,
                  rotateY: isActive ? activeRotateY : 0,
                  transformStyle: 'preserve-3d',
                }}
                className="relative h-full w-full"
              >
                {/* Project Background Image */}
                <img
                  src={project.image}
                  alt={project.title}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    opacity: isActive ? 0.42 : hoveredIndex === index ? 0.3 : 0.55,
                    transition: 'opacity 0.5s ease',
                  }}
                  className="absolute inset-0"
                />

                {/* Dynamic Specular Sheen on 3D active card */}
                {isActive && (
                  <div
                    style={{
                      background:
                        'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.18) 0%, transparent 70%)',
                    }}
                    className="absolute inset-0 pointer-events-none"
                  />
                )}

                {/* YouTube Video Indicator Badge */}
                {project.youtubeId && (
                  <div className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-red-600/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-md">
                    <span>▶</span>
                    <span>YOUTUBE</span>
                  </div>
                )}

                {/* Active Card Content (Centered Title, Description, White Pill Button) */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 flex h-full w-full flex-col items-center justify-end p-7 sm:p-9 text-center text-white [transform:translateZ(30px)]"
                  >
                    <div className="flex flex-col items-center gap-2.5 max-w-full">
                      <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight">
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
                      className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 font-sans text-xs sm:text-sm font-bold text-zinc-950 shadow-lg transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>{lang === 'fr' ? 'Explorer le projet' : 'Learn More'}</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white cursor-pointer"
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
                    width: isDotActive ? 24 : 7,
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white cursor-pointer"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};
