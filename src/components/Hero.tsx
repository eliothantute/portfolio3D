import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Language } from '../types';
import { ScrambleText } from './ScrambleText';

gsap.registerPlugin(ScrollTrigger);
// Mobile address-bar show/hide must not re-measure the pinned hero mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

interface HeroProps {
  lang: Language;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const MOBILE_QUERY = '(max-width: 640px)';
const SMOOTHING = 0.08;
const BASE = import.meta.env.BASE_URL;

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const getMedia = () => {
  const isMobile = typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
  const saveData = typeof navigator !== 'undefined' && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return {
    isMobile,
    src: saveData ? undefined : `${BASE}video/${isMobile ? 'hero-scrub-mobile.mp4' : 'hero-scrub.mp4'}`,
    poster: `${BASE}video/${isMobile ? 'hero-poster-mobile.jpg' : 'hero-poster.jpg'}`,
  };
};

export const Hero: React.FC<HeroProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  const [media] = useState(getMedia);
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

    video.muted = true;
    // iOS Safari only paints seeked frames once the video has been played once.
    const prime = () => {
      video.play().then(() => video.pause()).catch(() => {});
    };
    if (video.readyState >= 1) prime();
    else video.addEventListener('loadedmetadata', prime, { once: true });

    // The loop only runs while the playhead is catching up with the scroll.
    const tick = () => {
      current += (target - current) * SMOOTHING;
      if (Math.abs(target - current) < 0.0005) current = target;

      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        const time = current * duration;
        if (!video.seeking && Math.abs(video.currentTime - time) > 0.03) {
          video.currentTime = time;
        }
        if (timecodeRef.current) {
          timecodeRef.current.textContent = `${formatTime(time)} / ${formatTime(duration)}`;
        }
      }
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${current})`;

      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    video.addEventListener('loadedmetadata', wake);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * (media.isMobile ? 3 : 4.5)}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        target = self.progress;
        wake();
        const fade = Math.max(0, 1 - self.progress / 0.12);
        if (titleRef.current) {
          titleRef.current.style.opacity = String(fade);
          titleRef.current.style.transform = `translate3d(0, ${(1 - fade) * -40}px, 0)`;
        }
        if (hintRef.current) hintRef.current.style.opacity = String(fade);
      },
    });

    return () => {
      cancelAnimationFrame(raf);
      trigger.kill();
      video.removeEventListener('loadedmetadata', prime);
      video.removeEventListener('loadedmetadata', wake);
    };
  }, [media.isMobile]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-[100vh] w-full overflow-hidden bg-zinc-950 text-white supports-[height:100lvh]:h-[100lvh]"
      onMouseEnter={() => onHoverItem?.('ELIOT LAB // FILM')}
      onMouseLeave={onLeaveItem}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={media.src}
        poster={media.poster}
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/40" />

      {/* Ancré au bas de la zone visible (svh) même quand la barre d'adresse mobile est affichée */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex h-[100vh] w-full max-w-[1440px] flex-col justify-end px-3 pb-20 supports-[height:100svh]:h-[100svh] sm:px-6 sm:pb-24 lg:px-10"
        style={{ containerType: 'inline-size' }}
      >
        <div ref={titleRef} className="will-change-transform">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="block px-1 font-space-mono text-xs font-normal uppercase tracking-[-0.01em] text-white/70 sm:text-base"
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

        {/* Barre cinéma : timecode + progression */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-7 lg:px-10">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 sm:text-xs sm:tracking-[0.3em]">
            <span ref={timecodeRef} className="tabular-nums">00:00 / 00:00</span>
            <div ref={hintRef}>{lang === 'fr' ? 'Défiler' : 'Scroll'}<span className="hidden sm:inline">{lang === 'fr' ? ' pour explorer' : ' to explore'}</span></div>
            <span>+</span>
          </div>
          <div className="mt-3 h-px w-full bg-white/15">
            <div ref={progressRef} className="h-full origin-left scale-x-0 bg-white/80" />
          </div>
        </div>
      </div>
    </section>
  );
};
