import React from 'react';
import { Language } from '../types';

interface CinematicVideoSectionProps {
  lang: Language;
}

const CINEMATIC_VIDEOS = [
  {
    id: 'p_tCq55WbfA',
    label: 'Film 01',
    title: 'Motion Study',
    note: 'Cinematic pacing, light choreography and architectural tension.',
    frenchNote: 'Rythme cinématique, chorégraphie lumineuse et tension architecturale.',
  },
  {
    id: '066sAQYrylw',
    label: 'Film 02',
    title: 'Spatial Flow',
    note: 'A second sequence built as an immersive, editorial showcase.',
    frenchNote: 'Une seconde séquence pensée comme un showcase éditorial immersif.',
  },
] as const;

const buildEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1&playlist=${videoId}`;

export const CinematicVideoSection: React.FC<CinematicVideoSectionProps> = ({ lang }) => {
  return (
    <section className="relative z-10 overflow-hidden border-t border-slate-200 bg-[linear-gradient(180deg,#f7f9fd_0%,#eef2f9_28%,#eef2f9_100%)] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(111,140,255,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,111,61,0.08),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.08),transparent_30%)]" />
      <div className="mx-auto max-w-[1680px] px-4 sm:px-8 lg:px-10">
        <div className="grid gap-12 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <div className="max-w-xl space-y-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
                {lang === 'fr' ? 'Séquences vidéo' : 'Video sequences'}
              </span>
              <h2 className="max-w-xl font-display text-4xl leading-[0.9] tracking-tight text-[#10131a] sm:text-6xl xl:text-[5.2rem]">
                {lang === 'fr'
                  ? 'Deux vidéos séparées, en grand format.'
                  : 'Two separated videos, large format.'}
              </h2>
              <p className="max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
                {lang === 'fr'
                  ? 'Chaque vidéo est présentée dans son propre bloc, avec un vrai espace entre les deux pour améliorer la lecture visuelle.'
                  : 'Each video is presented in its own block with clear spacing between both for better visual rhythm.'}
              </p>
            </div>
          </div>

          <div className="grid gap-10 sm:gap-14">
            {CINEMATIC_VIDEOS.map((video, index) => (
              <article
                key={video.id}
                className={`video-card-reveal group overflow-hidden rounded-[36px] border border-slate-300/80 bg-[#0b1020] text-white shadow-[0_30px_100px_rgba(15,23,42,0.2)] ${index === 0 ? 'xl:translate-x-4' : 'xl:-translate-x-4'}`}
                style={{ '--card-delay': `${index * 0.14}s` } as React.CSSProperties}
              >
                <div className="relative min-h-[72vh] overflow-hidden sm:min-h-[78vh]">
                  <iframe
                    className="absolute inset-0 h-full w-full scale-[1.05]"
                    src={buildEmbedUrl(video.id)}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,24,0.12)_0%,rgba(7,11,24,0.04)_22%,rgba(7,11,24,0.72)_100%)]" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 transition-opacity duration-500 group-hover:ring-white/20" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/75 backdrop-blur-md sm:left-6 sm:top-6">
                    {video.label}
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-md transition-colors hover:bg-white hover:text-black sm:right-6 sm:top-6"
                  >
                    YouTube ↗
                  </a>
                </div>

                <div className="relative border-t border-white/10 bg-[linear-gradient(180deg,rgba(9,13,25,0.96)_0%,rgba(12,18,34,0.98)_100%)] px-5 py-6 sm:px-6 sm:py-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl leading-none tracking-tight sm:text-4xl">
                        {video.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                        {lang === 'fr' ? video.frenchNote : video.note}
                      </p>
                    </div>

                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};