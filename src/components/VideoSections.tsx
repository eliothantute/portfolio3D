import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

const BASE = import.meta.env.BASE_URL;
const EASE = [0.16, 1, 0.3, 1] as const;

const Label: React.FC<{ num: string; text: string }> = ({ num, text }) => (
  <div className="flex items-center gap-2">
    <span className="font-mono text-xs font-bold text-zinc-400">{num} //</span>
    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:text-xs">{text}</span>
  </div>
);

export const ShowreelSection: React.FC<{ lang: Language; num: string }> = ({ lang, num }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Only decode the reel while it is on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.2 });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <section id="showreel" className="relative w-full pt-10 scroll-mt-24">
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-8 lg:px-12">
        <Label num={num} text="Showreel" />
      </div>
      <video
        ref={videoRef}
        src={`${BASE}video/showreel.mp4`}
        poster={`${BASE}video/showreel-poster.jpg`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={lang === 'fr' ? 'Showreel Eliot Lab' : 'Eliot Lab showreel'}
        className="block aspect-video w-full bg-black object-cover"
      />
    </section>
  );
};

export const SyzygySection: React.FC<{ lang: Language; num: string }> = ({ lang, num }) => {
  const fr = lang === 'fr';
  const credits = fr
    ? [
        { k: 'Musique', v: 'Composition et production du morceau.' },
        { k: 'Visuel 3D', v: 'Création de l’univers en particules.' },
        { k: 'Logiciel', v: 'Outil maison qui transforme des images en particules.' },
      ]
    : [
        { k: 'Music', v: 'Composition and production of the track.' },
        { k: '3D visuals', v: 'Design of the particle world.' },
        { k: 'Software', v: 'In-house tool that turns images into particles.' },
      ];

  return (
    <section id="syzygy" className="relative w-full pt-10 scroll-mt-24">
      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-6 px-4 sm:px-8 lg:px-12">
        <Label num={num} text={fr ? 'Projet personnel' : 'Personal project'} />
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-urbanist text-[16vw] text-zinc-950 dark:text-white sm:text-[11vw] lg:text-[9rem]"
          >
            Syzygy
          </motion.h2>
          <p className="max-w-md font-mono text-xs uppercase leading-relaxed tracking-wider text-zinc-600 dark:text-zinc-400 sm:text-sm">
            {fr
              ? 'Teaser de ma release 2026. J’ai tout créé : la musique, le visuel 3D et le logiciel qui transforme les images en particules.'
              : 'Teaser for my 2026 release. I made all of it: the music, the 3D visuals and the software that turns images into particles.'}
          </p>
        </div>
      </div>

      <video
        src={`${BASE}video/syzygy.mp4`}
        poster={`${BASE}video/syzygy-poster.jpg`}
        controls
        playsInline
        preload="metadata"
        aria-label={fr ? 'Teaser Syzygy' : 'Syzygy teaser'}
        className="block w-full bg-black"
        style={{ aspectRatio: '1280 / 940' }}
      />

      <dl className="mx-auto grid max-w-7xl grid-cols-1 gap-px px-4 pt-6 sm:grid-cols-3 sm:px-8 lg:px-12">
        {credits.map((c) => (
          <div key={c.k} className="border-t border-zinc-950 py-4 dark:border-white">
            <dt className="font-space-mono text-sm font-bold uppercase text-zinc-950 dark:text-white">{c.k}</dt>
            <dd className="mt-1 font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{c.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
