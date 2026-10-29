import React, { useEffect, useRef, useState } from 'react';
import { motion, MotionValue, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { Language } from '../types';
import photo1 from '../assets/gallery/photo-1.jpg';
import photo2 from '../assets/gallery/photo-2.jpg';
import photo3 from '../assets/gallery/photo-3.jpg';
import photo4 from '../assets/gallery/photo-4.jpg';
import photo5 from '../assets/gallery/photo-5.jpg';

// Positions are % of the stage; width % of its width; ratio = width / height.
// dir: how far the box travels sideways, as a multiple of the shared spread.
const SLOTS = [
  { src: photo1, left: 37, top: 12, width: 26, ratio: 2 / 3, dir: 0 },
  { src: photo2, left: 14, top: 30, width: 28, ratio: 3 / 2, dir: -0.5 },
  { src: photo3, left: 61, top: 16, width: 14, ratio: 2 / 3, dir: 0.5 },
  { src: photo4, left: 20, top: 58, width: 17, ratio: 9 / 16, dir: -1 },
  { src: photo5, left: 58, top: 56, width: 20, ratio: 9 / 16, dir: 1 },
];
const PHONE_SLOTS = [
  { left: 24, top: 10, width: 52 },
  { left: 2, top: 22, width: 40 },
  { left: 68, top: 6, width: 26 },
  { left: 6, top: 66, width: 30 },
  { left: 60, top: 70, width: 32 },
];
const STAGE_RATIO = 100 / 90;
const PHONE_STAGE_RATIO = 100 / 150;
const SPRING = { stiffness: 140, damping: 30, mass: 0.5 };

const Photo: React.FC<{
  src: string;
  style: React.CSSProperties;
  dir: number;
  spread: MotionValue<number>;
  drop: MotionValue<number>;
  priority: number;
}> = ({ src, style, dir, spread, drop, priority }) => {
  const x = useTransform(spread, (v) => v * dir);
  return (
    <motion.div className="absolute overflow-hidden bg-zinc-200 dark:bg-zinc-900" style={{ ...style, x, y: drop, zIndex: priority }}>
      <img src={src} alt="" loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
    </motion.div>
  );
};

export const CollageSpread: React.FC<{ lang: Language }> = ({ lang }) => {
  const fr = lang === 'fr';
  const stageRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const spreadRaw = useMotionValue(0);
  const dropRaw = useMotionValue(0);
  const textRaw = useMotionValue(0);
  const spread = useSpring(spreadRaw, SPRING);
  const drop = useSpring(dropRaw, SPRING);
  const textY = useSpring(textRaw, SPRING);
  const { scrollY } = useScroll();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const update = () => {
    const el = stageRef.current;
    if (!el) return;
    const vh = window.innerHeight;
    const { top, height, width } = el.getBoundingClientRect();
    // 0 when the stage enters at the bottom of the screen, 1 when its lower photos reach the top.
    const t = Math.min(1, Math.max(0, (vh - top) / (vh + height * 0.85)));
    const maxSpread = width * (narrow ? 0.32 : 0.2);
    spreadRaw.set(maxSpread * t);
    dropRaw.set(maxSpread * t);
    textRaw.set(-0.15 * Math.max(0, vh - top));
  };
  useMotionValueEvent(scrollY, 'change', update);
  useEffect(update, [narrow]);

  return (
    <section id="gallery" className="relative w-full overflow-x-clip pb-[24vw] pt-10 sm:pb-[14vw]">
      <div className="mx-auto mb-10 flex max-w-7xl items-center gap-2 px-4 sm:px-8 lg:px-12">
        <span className="font-mono text-xs font-bold text-zinc-400">05 //</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:text-xs">
          Portrait
        </span>
      </div>

      <div ref={stageRef} className="relative mx-auto w-full max-w-[1200px]" style={{ aspectRatio: narrow ? PHONE_STAGE_RATIO : STAGE_RATIO }}>
        {SLOTS.map((slot, i) => {
          const pos = narrow ? { ...slot, ...PHONE_SLOTS[i] } : slot;
          return (
            <Photo
              key={slot.src}
              src={slot.src}
              dir={slot.dir}
              spread={spread}
              drop={drop}
              priority={i === 0 ? 5 : 1}
              style={{ left: `${pos.left}%`, top: `${pos.top}%`, width: `${pos.width}%`, aspectRatio: `${slot.ratio}` }}
            />
          );
        })}
      </div>

      <motion.div style={{ y: textY }} className="relative z-10 mx-auto -mt-[12%] flex max-w-3xl flex-col items-center px-4 text-center">
        <h2 className="font-urbanist text-[13vw] text-zinc-950 mix-blend-difference dark:text-white sm:text-[9vw] lg:text-[8rem]">
          Portrait
        </h2>
      </motion.div>
    </section>
  );
};
