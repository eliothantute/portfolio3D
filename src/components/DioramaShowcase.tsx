import React from 'react';
import { Language } from '../types';
import { MorphingShapes } from './MorphingShapes';

export const DioramaShowcase: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <section id="diorama" className="relative w-full scroll-mt-24">
      <div>
        <div className="relative w-full h-[80vh] min-h-[420px] overflow-hidden bg-[#040307]">
          <MorphingShapes lang={lang} />
        </div>
      </div>
    </section>
  );
};
