import React from 'react';
import { Language } from '../types';
import { TokyoOtakuDiorama } from './TokyoOtakuDiorama';

interface DioramaShowcaseProps {
  lang: Language;
}

export const DioramaShowcase: React.FC<DioramaShowcaseProps> = ({ lang }) => {
  return (
    <section id="diorama" className="relative w-full px-3 sm:px-6 lg:px-10 py-10 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-zinc-400">04 //</span>
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {lang === 'fr' ? 'CÔTÉ ATELIER' : 'BEHIND THE SCENES'}
          </span>
        </div>
        <div className="relative w-full h-[55vh] min-h-[380px] max-h-[520px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-zinc-950">
          <TokyoOtakuDiorama />
        </div>
        <p className="mt-4 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          {lang === 'fr'
            ? "Un diorama 3D fait pour le plaisir — Three.js, shaders et lumière procédurale."
            : 'A 3D diorama built for fun — Three.js, custom shaders and procedural lighting.'}
        </p>
      </div>
    </section>
  );
};
