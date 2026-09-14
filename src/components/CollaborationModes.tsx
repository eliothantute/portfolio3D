import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import {
  Palette,
  Code2,
  Rocket,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Boxes,
  Cpu,
  Layers,
  Flame,
} from 'lucide-react';
import { InteractiveText } from './InteractiveText';

interface CollaborationModesProps {
  lang: Language;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

export const CollaborationModes: React.FC<CollaborationModesProps> = ({
  lang,
  onOpenContact,
  onHoverItem,
  onLeaveItem,
  hideHeader = false,
}) => {
  const modes = [
    {
      id: 'full-cycle',
      num: '01',
      badge: lang === 'fr' ? 'DE A À Z // CLÉ EN MAIN' : 'END-TO-END // ALL-IN-ONE',
      title: lang === 'fr' ? 'Propositions, Intégration & Déploiement' : 'Design Concepts, Front-End & Deploy',
      subtitle:
        lang === 'fr'
          ? 'Je prends en charge tout le cycle : de la direction artistique et des maquettes interactives sur Figma jusqu’au code front-end réactif et à la mise en ligne.'
          : 'Full lifecycle ownership: from bespoke Figma creative concepts and art direction to production-ready front-end code and live deployment.',
      icon: Palette,
      accentColor: '#18181b',
      deliverables:
        lang === 'fr'
          ? [
              'Propositions graphiques & Direction Artistique',
              'Prototypage & Design System complet sous Figma',
              'Développement Front-End React 19 & TypeScript',
              'Déploiement Vercel, nom de domaine & optimisation SEO',
            ]
          : [
              'Visual concepts & bespoke Art Direction',
              'Figma prototyping & complete Design System',
              'React 19 & TypeScript front-end architecture',
              'Vercel deployment, custom domain & SEO polish',
            ],
      bestFor:
        lang === 'fr'
          ? 'Startups, marques & créateurs souhaitant un interlocuteur unique pour tout gérer.'
          : 'Startups, brands & creators seeking a single partner from concept to launch.',
      cta: lang === 'fr' ? 'Lancer un projet complet' : 'Start an end-to-end project',
    },
    {
      id: 'frontend-integration',
      num: '02',
      badge: lang === 'fr' ? 'FIGMA TO CODE // PIXEL-PERFECT' : 'FIGMA TO CODE // PIXEL-PERFECT',
      title: lang === 'fr' ? 'Intégration Pure & Micro-Interactions' : 'Pure Integration & Micro-Interactions',
      subtitle:
        lang === 'fr'
          ? 'Vos maquettes sont déjà prêtes ? Je les traduis en code ultra-rapide, fidèle au pixel près, avec des animations fluides et une ergonomie irréprochable.'
          : 'Already have your Figma designs? I translate them into clean, high-performance code with meticulous pixel-accuracy and fluid micro-animations.',
      icon: Code2,
      accentColor: '#27272a',
      deliverables:
        lang === 'fr'
          ? [
              'Respect absolu de vos maquettes Figma & typographie',
              'Micro-interactions fluides (GSAP & Framer Motion)',
              'Composants propres, modulaires & réutilisables',
              'Responsive minutieux (Mobile, Tablette, Desktop)',
            ]
          : [
              'Pixel-perfect adherence to your Figma files',
              'Fluid GSAP & Framer Motion micro-interactions',
              'Modular, maintainable & clean component architecture',
              'Flawless responsive layouts across all devices',
            ],
      bestFor:
        lang === 'fr'
          ? 'Agences web, studios créatifs & designers UI/UX ayant besoin d’un bras droit technique.'
          : 'Web agencies, creative studios & UI designers needing a top-tier code partner.',
      cta: lang === 'fr' ? 'Intégrer vos maquettes' : 'Integrate your designs',
    },
    {
      id: 'deployment-3d',
      num: '03',
      badge: lang === 'fr' ? '3D & PERFORMANCE // IMMERSION' : '3D IMMERSION & CLOUD DEPLOY',
      title: lang === 'fr' ? 'Animation 3D, Performance & Déploiement' : '3D Animation, Speed & Deployment',
      subtitle:
        lang === 'fr'
          ? 'Votre site existe déjà ou vous avez le code ? J’injecte des expériences 3D immersives (Three.js/WebGL), optimise la fluidité à 60 FPS et gère le déploiement.'
          : 'Already have a site or codebase? I integrate real-time 3D scenes, optimize GPU rendering to constant 60 FPS, and set up rock-solid cloud deployment.',
      icon: Rocket,
      accentColor: '#3f3f46',
      deliverables:
        lang === 'fr'
          ? [
              'Scènes 3D interactives Three.js & React Three Fiber',
              'Shaders GLSL sur-mesure & effets de particules',
              'Optimisation drastique GPU & 60 FPS constants',
              'Mise en ligne CI/CD, hébergement cloud & monitoring',
            ]
          : [
              'Interactive Three.js & React Three Fiber scenes',
              'Custom GLSL shaders & procedural particle effects',
              'Drastic GPU & rendering optimizations (locked 60 FPS)',
              'CI/CD cloud deployment, hosting setup & monitoring',
            ],
      bestFor:
        lang === 'fr'
          ? 'Projets souhaitant marquer les esprits avec de la 3D ou sécuriser leur déploiement.'
          : 'Brands looking for standout 3D immersion or rock-solid production deployment.',
      cta: lang === 'fr' ? 'Ajouter de la 3D ou déployer' : 'Add 3D or deploy now',
    },
  ];

  return (
    <section id="collaboration" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 lg:px-12 scroll-mt-24">
      {/* Section Header */}
      {!hideHeader && (
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="quora-pill mb-3">
              <span className="h-2 w-2 rounded-full bg-zinc-950 dark:bg-white animate-pulse" />
              <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                00 // {lang === 'fr' ? 'FLEXIBILITÉ & MODES D’INTERVENTION' : 'COLLABORATION MODES & WORKFLOW'}
              </span>
            </div>

            <h2 className="font-urbanist text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white leading-[1.05]">
              {lang === 'fr' ? 'Du design au déploiement :' : 'From design to deployment:'}{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                <InteractiveText
                  text={lang === 'fr' ? '3 façons de collaborer.' : '3 ways we can work together.'}
                  hoverColor="#52525b"
                />
              </span>
            </h2>
          </div>

          <p className="max-w-md font-urbanist text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {lang === 'fr'
              ? 'Entre sensibilité design et rigueur front-end, je m’adapte à votre projet : création complète avec propositions, intégration fidèle de vos maquettes ou simple déploiement avec touche 3D.'
              : 'Bridging design craft and front-end engineering, I adapt to your needs: full creative delivery with bespoke proposals, pixel-perfect integration, or pure 3D enhancement & deployment.'}
          </p>
        </div>
      )}

      {/* 3 Collaboration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {modes.map((mode, index) => {
          const Icon = mode.icon;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => onHoverItem?.(mode.title.toUpperCase())}
              onMouseLeave={onLeaveItem}
              className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-xl hover:-translate-y-1.5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
            >
              {/* Card Header: Step number & Badge */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-950 group-hover:text-white dark:bg-zinc-800 dark:text-white dark:group-hover:bg-zinc-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-sm font-bold text-zinc-400 dark:text-zinc-500">
                    {mode.num} //
                  </span>
                </div>

                {/* Badge & Title */}
                <div className="mt-5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {mode.badge}
                  </span>
                  <h3 className="font-urbanist mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    {mode.title}
                  </h3>
                </div>

                {/* Subtitle / Description */}
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {mode.subtitle}
                </p>

                {/* Deliverables Checklist */}
                <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {lang === 'fr' ? 'CE QUI EST INCLUS :' : 'WHAT IS DELIVERED:'}
                  </span>
                  <ul className="mt-2.5 space-y-2">
                    {mode.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-white shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Audience Pill */}
                <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {lang === 'fr' ? 'Pour qui ? ' : 'Best for: '}
                  </span>
                  {mode.bestFor}
                </div>
              </div>

              {/* Bottom Action CTA */}
              <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenContact) {
                      onOpenContact();
                    } else {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group/btn inline-flex w-full items-center justify-between rounded-xl bg-zinc-950 px-4 py-3 text-xs font-urbanist font-bold text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-98 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  <span>{mode.cta}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Specialty 3D & Interaction Banner Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="quora-dark-card mt-8 p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-mono backdrop-blur-md mb-4">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="text-white font-bold">
                {lang === 'fr' ? 'SPÉCIALISATION MAÎTRESSE // SIGNATURE' : 'SIGNATURE SPECIALIZATION // 3D & CRAFT'}
              </span>
            </div>

            <h3 className="font-urbanist text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'fr'
                ? "L'animation 3D temps réel et l'interaction qui captivent."
                : 'Real-time 3D animation and spatial interaction.'}
            </h3>

            <p className="mt-2 text-sm text-zinc-300 font-urbanist leading-relaxed">
              {lang === 'fr'
                ? "Au-delà du site vitrine statique, je donne vie aux interfaces grâce à des scènes WebGL fluides, des shaders procéduraux et des micro-interactions physiques réactives à 60 FPS. C’est ce qui transforme un simple visiteur en client marqué par votre univers."
                : "Far beyond static websites, I breathe life into digital products with fluid WebGL spatial scenes, procedural shaders, and responsive physical interactions at locked 60 FPS. Creating lasting emotional impressions for visionary brands."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {/* 3D Tech Pills */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-zinc-200 backdrop-blur-sm">
                Three.js &amp; R3F
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-zinc-200 backdrop-blur-sm">
                GLSL Shaders
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-zinc-200 backdrop-blur-sm">
                GSAP &amp; Lenis 60 FPS
              </span>
            </div>

            <a
              href="#projects"
              onMouseEnter={() => onHoverItem?.('VOIR LES PROJETS')}
              onMouseLeave={onLeaveItem}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-urbanist text-xs font-bold text-zinc-950 shadow-lg transition-all hover:scale-105 hover:bg-zinc-200 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Voir les projets' : 'Explore Projects'}</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Ambient subtle glow background effect */}
        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </motion.div>
    </section>
  );
};
