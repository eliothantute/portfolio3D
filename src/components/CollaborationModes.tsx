import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import {
  Palette,
  RefreshCw,
  Zap,
  Music,
  CheckCircle2,
  ArrowRight,
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
      id: 'design-to-deployment',
      num: '01',
      badge: lang === 'fr' ? 'DE A À Z // CLÉ EN MAIN' : 'END-TO-END // ALL-IN-ONE',
      title: lang === 'fr' ? 'Design au Déploiement' : 'Design to Deployment',
      subtitle:
        lang === 'fr'
          ? 'Prise en charge complète de votre projet : de la direction artistique et maquettes Figma jusqu’au code front-end réactif et à la mise en ligne finale.'
          : 'Complete project ownership: from art direction and bespoke Figma prototypes to responsive front-end development and live cloud deployment.',
      icon: Palette,
      deliverables:
        lang === 'fr'
          ? [
              'Direction artistique & maquettes interactives Figma',
              'Développement Front-End React 19 & TypeScript',
              'Design System modulaire & responsive minutieux',
              'Mise en ligne, domaine personnalisé & SEO optimisé',
            ]
          : [
              'Art direction & interactive Figma prototypes',
              'React 19 & TypeScript front-end architecture',
              'Modular design system & pixel-perfect responsive',
              'Live deployment, custom domain & optimized SEO',
            ],
      bestFor:
        lang === 'fr'
          ? 'Créateurs, marques & startups souhaitant un interlocuteur unique pour concevoir et lancer un site complet.'
          : 'Creators, brands & startups looking for a single specialist to design and launch an entire product.',
      cta: lang === 'fr' ? 'Lancer un projet complet' : 'Start end-to-end project',
    },
    {
      id: 'refonte',
      num: '02',
      badge: lang === 'fr' ? 'MODERNISATION // ERGONOMIE' : 'MODERNIZATION // REDESIGN',
      title: lang === 'fr' ? 'Refonte de Site & d’Expérience' : 'Website & UX Redesign',
      subtitle:
        lang === 'fr'
          ? 'Modernisation intégrale d’un site ou produit existant : nouveau souffle visuel, parcours utilisateur simplifié, optimisation mobile et accélération des performances.'
          : 'Full modernization of an existing site or product: fresh contemporary aesthetics, simplified user journeys, mobile polish, and massive speed boost.',
      icon: RefreshCw,
      deliverables:
        lang === 'fr'
          ? [
              'Audit ergonomique, visuel et technique de l’existant',
              'Refonte de l’interface graphique contemporaine & épurée',
              'Reconstruction de l’expérience avec code moderne et propre',
              'Amélioration de la fluidité, du responsive et des conversions',
            ]
          : [
              'Comprehensive UX, visual and performance audit',
              'Contemporary, clean graphic interface redesign',
              'Rebuilding experience with modern clean code',
              'Significant improvements in responsiveness and conversions',
            ],
      bestFor:
        lang === 'fr'
          ? 'Entreprises et indépendants dont le site a vieilli et qui souhaitent retrouver un impact visuel fort.'
          : 'Companies and businesses whose existing website needs modern visual elevation and clarity.',
      cta: lang === 'fr' ? 'Discuter d’une refonte' : 'Discuss a redesign',
    },
    {
      id: 'animation-integration',
      num: '03',
      badge: lang === 'fr' ? 'MICRO-INTERACTIONS // 3D WEBGL' : 'MICRO-INTERACTIONS // 3D WEBGL',
      title: lang === 'fr' ? 'Intégration d’Animation & 3D' : 'Animation & 3D Integration',
      subtitle:
        lang === 'fr'
          ? 'Enrichissement d’interfaces web avec des animations fluides (GSAP, Framer Motion) et modules 3D temps réel (Three.js/WebGL) pour une expérience vivante et marquante.'
          : 'Elevating web interfaces with fluid micro-interactions (GSAP, Framer Motion) and interactive real-time 3D modules (Three.js/WebGL) for unforgettable impressions.',
      icon: Zap,
      deliverables:
        lang === 'fr'
          ? [
              'Animations fluides au scroll, au curseur et au clic',
              'Intégration de scènes 3D interactives légères et stables',
              'Micro-interactions soignées au millimètre près',
              'Optimisation drastique pour 60 FPS constants sans saccades',
            ]
          : [
              'Smooth scroll-triggered and cursor interactions',
              'Lightweight, stable real-time 3D WebGL scenes',
              'Pixel-perfect micro-interactions and transitions',
              'Locked 60 FPS performance optimization',
            ],
      bestFor:
        lang === 'fr'
          ? 'Studios, agences et marques voulant transformer un site statique en une expérience interactive haut de gamme.'
          : 'Studios, agencies and brands looking to turn a static site into a high-end interactive experience.',
      cta: lang === 'fr' ? 'Ajouter des animations' : 'Add animations & 3D',
    },
    {
      id: 'composition-musicale',
      num: '04',
      badge: lang === 'fr' ? 'SOUND DESIGN // ATMOSPHÈRE' : 'SOUND DESIGN // ATMOSPHERE',
      title: lang === 'fr' ? 'Composition Musicale & Atmosphère' : 'Music Composition & Atmosphere',
      subtitle:
        lang === 'fr'
          ? 'Création d’univers sonores immersifs et compositions musicales sur-mesure pour sublimer vos expériences web, applications interactives et identités de marque.'
          : 'Original musical compositions and immersive soundscapes crafted to give web experiences and digital products a distinct sensory signature.',
      icon: Music,
      deliverables:
        lang === 'fr'
          ? [
              'Bandes originales & morceaux instrumentaux sur-mesure',
              'Sound design web interactif (retours audio aux interactions)',
              'Intégration de lecteurs audio personnalisés avec visualiseur',
              'Mixage et mastering professionnel haute fidélité',
            ]
          : [
              'Bespoke original soundtracks and musical scoring',
              'Interactive web audio cues and ambient soundscapes',
              'Custom embedded audio player with real-time visualizer',
              'High-fidelity mixing and professional mastering',
            ],
      bestFor:
        lang === 'fr'
          ? 'Projets artistiques, portfolios créatifs, marques de luxe et jeux web cherchant une identité sonore mémorable.'
          : 'Creative portfolios, luxury brands, artistic platforms and web games seeking audio personality.',
      cta: lang === 'fr' ? 'Créer une atmosphère sonore' : 'Craft audio identity',
    },
  ];

  return (
    <section id="modes" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-12 scroll-mt-24">
      {/* Section Header */}
      {!hideHeader && (
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-zinc-950 dark:bg-white animate-pulse" />
              <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                01 // {lang === 'fr' ? 'PRESTATIONS' : 'SERVICES'}
              </span>
            </div>

            <h2 className="font-urbanist text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white leading-[1.05]">
              {lang === 'fr' ? '4 façons d’intervenir sur votre projet.' : '4 ways we can collaborate on your project.'}
            </h2>
          </div>

          <p className="max-w-md font-urbanist text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {lang === 'fr'
              ? 'Du design au déploiement, en refonte complète, en injection d’animations ou en création d’atmosphère musicale, je m’adapte précisément à vos besoins.'
              : 'From complete design to deployment, comprehensive redesigns, animation integration, or bespoke musical atmosphere, tailored to your exact needs.'}
          </p>
        </div>
      )}

      {/* 4 Modes Cards Grid (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {modes.map((mode, index) => {
          const Icon = mode.icon;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => onHoverItem?.(mode.title.toUpperCase())}
              onMouseLeave={onLeaveItem}
              className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-xl hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-950 group-hover:text-white dark:bg-zinc-800 dark:text-white dark:group-hover:bg-zinc-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-sm font-bold text-zinc-400 dark:text-zinc-500">
                    {mode.num} //
                  </span>
                </div>

                <div className="mt-5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {mode.badge}
                  </span>
                  <h3 className="font-urbanist mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    {mode.title}
                  </h3>
                </div>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {mode.subtitle}
                </p>

                {/* Deliverables */}
                <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {lang === 'fr' ? 'CE QUI EST INCLUS :' : 'DELIVERABLES:'}
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

                {/* Target Audience */}
                <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {lang === 'fr' ? 'Pour qui ? ' : 'Best for: '}
                  </span>
                  {mode.bestFor}
                </div>
              </div>

              {/* Action CTA */}
              <div className="mt-7 pt-4 border-t border-zinc-100 dark:border-zinc-800">
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
    </section>
  );
};
