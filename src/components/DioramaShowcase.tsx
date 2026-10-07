import React from 'react';
import { TokyoOtakuDiorama } from './TokyoOtakuDiorama';

export const DioramaShowcase: React.FC = () => {
  return (
    <section id="diorama" className="relative w-full px-3 sm:px-6 lg:px-10 py-16 sm:py-10 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative w-full h-[55vh] min-h-[380px] max-h-[520px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-zinc-950">
          <TokyoOtakuDiorama />
        </div>
      </div>
    </section>
  );
};
