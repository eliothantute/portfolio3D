import React from 'react';
import { motion } from 'framer-motion';
import { Language, SkillType } from '../types';
import {
  Code2,
  Palette,
  Cpu,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Boxes,
  Layers,
  Terminal,
} from 'lucide-react';
import { skillsCategories, stackCategoriesData } from '../data/projects';

interface SkillsGridCardsProps {
  lang: Language;
  onSelectSkill: (skillType: SkillType) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const SkillsGridCards: React.FC<SkillsGridCardsProps> = ({
  lang,
  onSelectSkill,
  onHoverItem,
  onLeaveItem,
}) => {
  const cards = [
    {
      id: 'frontend',
      type: 'frontend' as SkillType,
      num: '01',
      badge: lang === 'fr' ? 'REACT 19 // THREE.JS & 3D' : 'REACT 19 // THREE.JS & 3D',
      title: lang === 'fr' ? 'Front-End & 3D WebGL' : 'Front-End & 3D WebGL',
      subtitle:
        lang === 'fr'
          ? 'Conception d’interfaces immersives et scènes 3D interactives à 60 FPS constants avec React 19, Three.js, shaders GLSL et micro-interactions soignées.'
          : 'Immersive UI engineering and interactive 3D spatial scenes locked at 60 FPS using React 19, Three.js, custom GLSL shaders, and refined motion.',
      icon: Code2,
      skills: [
        'React 19 & TypeScript',
        'Three.js & React Three Fiber',
        'Tailwind CSS & Framer Motion',
        'Shaders WebGL / GLSL',
        'Vite, Next.js & Web Audio',
      ],
      bestFor:
        lang === 'fr'
          ? 'Expériences immersives, scènes 3D interactives, fluidité 60 FPS et interfaces audacieuses.'
          : 'Standout 3D spatial sites, fluid 60 FPS animations, and next-gen creative web products.',
      cta: lang === 'fr' ? 'Explorer les projets Front-End' : 'Explore Front-End projects',
    },
    {
      id: 'design',
      type: 'design' as SkillType,
      num: '02',
      badge: lang === 'fr' ? 'FIGMA // DESIGN SYSTEMS & DA' : 'FIGMA // DESIGN SYSTEMS & ART DIRECTION',
      title: lang === 'fr' ? 'Design UI/UX & Prototypage' : 'UI/UX Design & Prototyping',
      subtitle:
        lang === 'fr'
          ? 'Direction artistique contemporaine, conception de design systems scalables sous Figma, prototypage interactif haute fidélité et traduction pixel-perfect.'
          : 'Contemporary art direction, scalable Figma design systems, high-fidelity prototypes, and pixel-perfect bridge between design and code.',
      icon: Palette,
      skills: [
        'Design Systems scalables sous Figma',
        'Direction Artistique & Identité Visuelle',
        'UI/UX Design & Micro-interactions',
        'Intégration Figma vers Code fidèle',
        'Responsive Design multi-supports',
      ],
      bestFor:
        lang === 'fr'
          ? 'Création d’identités mémorables, ergonomie soignée et maquettes prêtes au pixel près.'
          : 'Bespoke brand identities, intuitive UX flows, and production-ready Figma architectures.',
      cta: lang === 'fr' ? 'Explorer les projets Design' : 'Explore Design projects',
    },
    {
      id: 'app',
      type: 'app' as SkillType,
      num: '03',
      badge: lang === 'fr' ? 'AGENTS IA // PWA & FULLSTACK' : 'AI AGENTS // PWA & FULL-STACK',
      title: lang === 'fr' ? 'Applications Web & IA' : 'Web Apps & AI Systems',
      subtitle:
        lang === 'fr'
          ? 'Développement d’applications web modernes, PWA géolocalisées, intégration de modèles LLMs (Gemini, Claude), architecture d’agents et cloud CI/CD.'
          : 'Modern web applications, geolocated PWAs, foundation model integration (Claude, Gemini), autonomous agent workflows, and CI/CD cloud pipelines.',
      icon: Cpu,
      skills: [
        'PWA & Web Apps mobiles géolocalisées',
        'Intégration de LLMs (Gemini, Claude)',
        'Architectures d’Agents Autonomes',
        'Tooling IA (Claude Code, Antigravity)',
        'Déploiement Cloud Vercel & CI/CD',
      ],
      bestFor:
        lang === 'fr'
          ? 'Outils SaaS réactifs, applications agentiques et utilitaires web performants.'
          : 'Modern SaaS products, agentic AI workflows, and fast mobile-first web platforms.',
      cta: lang === 'fr' ? 'Explorer les projets Apps & IA' : 'Explore App & AI projects',
    },
    {
      id: 'music',
      type: 'music' as SkillType,
      num: '04',
      badge: lang === 'fr' ? 'AUDIO // SOUND DESIGN & SCORE' : 'AUDIO // SOUND DESIGN & SCORING',
      title: lang === 'fr' ? 'Composition Musicale & Son' : 'Music Scoring & Sound Design',
      subtitle:
        lang === 'fr'
          ? 'Composition originale, sound design immersif d’interfaces, paysages sonores cinématiques et synchronisation sur créations visuelles et animations 3D.'
          : 'Original musical scoring, UI sound design, atmospheric cinematic soundscapes, and tight audio synchronization on visual 3D motion.',
      icon: Sparkles,
      skills: [
        'Composition musicale originale',
        'Sound Design d’interfaces & UI FX',
        'Arrangements & Production sonore',
        'Spatialisation & Synthèse sonore',
        'Synchronisation musique à l’image',
      ],
      bestFor:
        lang === 'fr'
          ? 'Univers de marque immersifs et habillages audio originaux sublimant la 3D.'
          : 'Immersive brand universes and bespoke audio scoring elevating visual experiences.',
      cta: lang === 'fr' ? 'Explorer les créations audio' : 'Explore audio works',
    },
  ];

  const stacks = stackCategoriesData[lang] || [];

  return (
    <div className="w-full space-y-8">
      {/* 4 Cards Grid - Exactly matching Section 00 style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => onHoverItem?.(card.title.toUpperCase())}
              onMouseLeave={onLeaveItem}
              className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-xl hover:-translate-y-1.5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
            >
              {/* Card Header: Icon & Step Number */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-950 group-hover:text-white dark:bg-zinc-800 dark:text-white dark:group-hover:bg-zinc-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-sm font-bold text-zinc-400 dark:text-zinc-500">
                    {card.num} //
                  </span>
                </div>

                {/* Badge & Title */}
                <div className="mt-5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {card.badge}
                  </span>
                  <h3 className="font-urbanist mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    {card.title}
                  </h3>
                </div>

                {/* Subtitle / Description */}
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {card.subtitle}
                </p>

                {/* Skills Checklist */}
                <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {lang === 'fr' ? 'COMPÉTENCES & OUTILS :' : 'KEY SKILLS & STACK:'}
                  </span>
                  <ul className="mt-2.5 space-y-2">
                    {card.skills.map((skill, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-white shrink-0 mt-0.5" />
                        <span className="leading-snug">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Focus / Target Audience Box */}
                <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {lang === 'fr' ? 'Point fort : ' : 'Key focus: '}
                  </span>
                  {card.bestFor}
                </div>
              </div>

              {/* Bottom CTA Action Button */}
              <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => onSelectSkill(card.type)}
                  className="group/btn inline-flex w-full items-center justify-between rounded-xl bg-zinc-950 px-4 py-3 text-xs font-urbanist font-bold text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-98 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  <span>{card.cta}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tech Stack & Ecosystem Summary Banner (Matching Section 00 Banner) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="quora-dark-card p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-mono backdrop-blur-md mb-4">
              <Terminal className="h-3.5 w-3.5 text-white" />
              <span className="text-white font-bold">
                {lang === 'fr' ? 'ENVIRONNEMENT & OUTILLAGE TECHNIQUE' : 'TECHNICAL STACK & TOOLING ECOSYSTEM'}
              </span>
            </div>

            <h3 className="font-urbanist text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'fr'
                ? 'Une chaîne de production moderne, rigoureuse et performante.'
                : 'A modern, high-velocity engineering and design workflow.'}
            </h3>

            <p className="mt-2 text-sm text-zinc-300 font-urbanist leading-relaxed">
              {lang === 'fr'
                ? 'De la conception sous Figma aux composants React 19 et shaders Three.js, chaque projet bénéficie d’une architecture TypeScript robuste, d’un déploiement continu automatisé et d’une optimisation stricte du temps de réponse.'
                : 'From Figma visual craft to React 19 and Three.js shaders, every product is powered by type-safe TypeScript, automated CI/CD deployment, and locked 60 FPS GPU performance.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {/* Stack Tags */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-zinc-200 backdrop-blur-sm">
                React 19 &amp; Vite
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-zinc-200 backdrop-blur-sm">
                TypeScript &amp; Tailwind
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-zinc-200 backdrop-blur-sm">
                Vercel &amp; CI/CD
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelectSkill('all')}
              onMouseEnter={() => onHoverItem?.('TOUS LES PROJETS')}
              onMouseLeave={onLeaveItem}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-urbanist text-xs font-bold text-zinc-950 shadow-lg transition-all hover:scale-105 hover:bg-zinc-200 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Voir tous les projets' : 'View all projects'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  );
};
