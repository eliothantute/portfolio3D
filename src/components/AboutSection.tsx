import React from 'react';
import { skillsList } from '../data/projects';
import { Language } from '../types';

interface AboutSectionProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  return (
    <section id="about" className="relative z-10 mx-auto max-w-7xl border-t border-slate-200 px-6 py-28 sm:px-16">
      <div className="grid items-start gap-14 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-6">
          <span className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
            <span className="h-px w-8 bg-slate-300" />
            Studio Profile
          </span>

          <h2 className="font-display text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            {lang === 'fr' ? 'Designer UI en premier. Développeur avec intention.' : 'UI designer first. Developer with intent.'}
          </h2>

          <div className="space-y-5 text-base leading-relaxed text-slate-700 sm:text-lg">
            <p>
              {lang === 'fr'
                ? "Basé à Paris, je conçois des interfaces fortes, silencieuses et lisibles. Le code intervient pour donner du rythme, de la matière et de la précision."
                : 'Based in Paris, I design strong, quiet and readable interfaces. Code comes in to add rhythm, material and precision.'}
            </p>
            <p className="text-slate-500">
              {lang === 'fr'
                ? 'Direction artistique, motion et performance sont pensés ensemble dès le départ.'
                : 'Art direction, motion and performance are designed together from the first frame.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="lux-panel rounded-[2rem] p-8 sm:p-10">
            <div className="mb-7 flex items-center justify-between border-b border-slate-200 pb-5">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-600">
                Capabilities
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">Live</span>
            </div>

            <div className="space-y-5">
              {skillsList.map((skill, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => onHoverItem?.(skill.level)}
                  onMouseLeave={onLeaveItem}
                  className="group lux-interactive"
                >
                  <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
                    <span className="text-slate-700">
                      {skill.name}
                      <span className="ml-2 text-slate-400">{skill.cat}</span>
                    </span>
                    <span className="text-slate-500">{skill.level}</span>
                  </div>

                  <div className="h-[6px] overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8ea6ff] to-[#d0dbff] transition-all duration-500 ease-out group-hover:brightness-110"
                      style={{ width: skill.level }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
