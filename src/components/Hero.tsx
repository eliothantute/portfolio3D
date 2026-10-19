import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Language } from '../types';
import { ScrambleText } from './ScrambleText';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  lang: Language;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const SCROLL_LENGTH = '+=450%';
const SMOOTHING = 0.08;

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export const Hero: React.FC<HeroProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let target = 0;
    let current = 0;
    let raf = 0;

    // iOS Safari only paints seeked frames once the video has been played once.
    const prime = () => {
      video.play().then(() => video.pause()).catch(() => {});
    };
    if (video.readyState >= 1) prime();
    else video.addEventListener('loadedmetadata', prime, { once: true });

    const tick = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        current += (target - current) * SMOOTHING;
        const time = current * duration;
        if (Math.abs(video.currentTime - time) > 0.01 && !video.seeking) {
          video.currentTime = time;
        }
        if (timecodeRef.current) {
          timecodeRef.current.textContent = `${formatTime(time)} / ${formatTime(duration)}`;
        }
      }
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${current})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: SCROLL_LENGTH,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        target = self.progress;
        const fade = Math.max(0, 1 - self.progress / 0.12);
        if (titleRef.current) {
          titleRef.current.style.opacity = String(fade);
          titleRef.current.style.transform = `translateY(${(1 - fade) * -40}px)`;
        }
        if (hintRef.current) hintRef.current.style.opacity = String(fade);
      },
    });

    return () => {
      cancelAnimationFrame(raf);
      trigger.kill();
      video.removeEventListener('loadedmetadata', prime);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-[100svh] w-full overflow-hidden bg-zinc-950 text-white"
      onMouseEnter={() => onHoverItem?.('ELIOT LAB // FILM')}
      onMouseLeave={onLeaveItem}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={`${import.meta.env.BASE_URL}video/hero-scrub-mobile.mp4`} type="video/mp4" media="(max-width: 640px)" />
        <source src={`${import.meta.env.BASE_URL}video/hero-scrub.mp4`} type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />

      <div
        className="pointer-events-none relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-3 pb-20 sm:px-6 sm:pb-24 lg:px-10"
        style={{ containerType: 'inline-size' }}
      >
        <div ref={titleRef} className="will-change-transform">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="block px-1 font-space-mono text-sm font-normal uppercase tracking-[-0.01em] text-white/70 sm:text-base"
          >
            <ScrambleText text={lang === 'fr' ? 'Développeur Front-End Créatif' : 'Creative Front-End Developer'} />
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            className="-ml-1 mt-1 select-none whitespace-nowrap font-space-mono font-bold uppercase leading-none text-white"
            style={{ fontSize: '18.5cqw', letterSpacing: '-0.02em' }}
          >
            Eliot Lab
          </motion.h1>
        </div>
      </div>

      {/* Barre cinéma : timecode + progression */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1440px] px-4 pb-5 sm:px-6 sm:pb-7 lg:px-10">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 sm:text-xs">
          <span ref={timecodeRef} className="tabular-nums">00:00 / 00:00</span>
          <div ref={hintRef}>{lang === 'fr' ? 'Défiler pour explorer' : 'Scroll to explore'}</div>
          <span>+</span>
        </div>
        <div className="mt-3 h-px w-full bg-white/15">
          <div ref={progressRef} className="h-full origin-left scale-x-0 bg-white/80" />
        </div>
      </div>
    </section>
  );
};
