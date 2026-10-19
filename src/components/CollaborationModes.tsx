import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Language } from '../types';
import { CheckCircle2, ArrowRight, ChevronDown } from 'lucide-react';

interface CollaborationModesProps {
  lang: Language;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Horizontal cascade offsets for each row, Mondragon-style staggered stack
// (desktop only — rows sit flush full-width on mobile).
const CASCADE = [
  { ml: '0%', w: '74%' },
  { ml: '30%', w: '70%' },
  { ml: '16%', w: '76%' },
  { ml: '4%', w: '80%' },
];

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
      caption: lang === 'fr' ? 'FIGMA, REACT, DÉPLOIEMENT.' : 'FIGMA, REACT, DEPLOYMENT.',
      title: lang === 'fr' ? 'Design au Déploiement' : 'Design to Deployment',
      subtitle:
        lang === 'fr'
          ? 'Prise en charge complète de votre projet : de la direction artistique et maquettes Figma jusqu’au code front-end réactif et à la mise en ligne finale.'
          : 'Complete project ownership: from art direction and bespoke Figma prototypes to responsive front-end development and live cloud deployment.',
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
      caption: lang === 'fr' ? 'AUDIT, UI, PERFORMANCE.' : 'AUDIT, UI, PERFORMANCE.',
      title: lang === 'fr' ? 'Refonte de Site & d’Expérience' : 'Website & UX Redesign',
      subtitle:
        lang === 'fr'
          ? 'Modernisation intégrale d’un site ou produit existant : nouveau souffle visuel, parcours utilisateur simplifié, optimisation mobile et accélération des performances.'
          : 'Full modernization of an existing site or product: fresh contemporary aesthetics, simplified user journeys, mobile polish, and massive speed boost.',
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
      caption: lang === 'fr' ? 'GSAP, THREE.JS, WEBGL.' : 'GSAP, THREE.JS, WEBGL.',
      title: lang === 'fr' ? 'Intégration d’Animation & 3D' : 'Animation & 3D Integration',
      subtitle:
        lang === 'fr'
          ? 'Enrichissement d’interfaces web avec des animations fluides (GSAP, Framer Motion) et modules 3D temps réel (Three.js/WebGL) pour une expérience vivante et marquante.'
          : 'Elevating web interfaces with fluid micro-interactions (GSAP, Framer Motion) and interactive real-time 3D modules (Three.js/WebGL) for unforgettable impressions.',
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
      caption: lang === 'fr' ? 'SOUND DESIGN, MIXAGE.' : 'SOUND DESIGN, MIXING.',
      title: lang === 'fr' ? 'Composition Musicale & Atmosphère' : 'Music Composition & Atmosphere',
      subtitle:
        lang === 'fr'
          ? 'Création d’univers sonores immersifs et compositions musicales sur-mesure pour sublimer vos expériences web, applications interactives et identités de marque.'
          : 'Original musical compositions and immersive soundscapes crafted to give web experiences and digital products a distinct sensory signature.',
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

  // Click opens/closes the panel (several can stay open at once); hover only
  // flips a row to its "negative" black look, without opening anything —
  // exactly the two separate interactions on the Mondragon reference.
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isFinePointer] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );

  const handleHoverStart = (id: string) => {
    if (isFinePointer) setHoveredId(id);
  };

  const handleHoverEnd = () => {
    if (isFinePointer) setHoveredId(null);
  };

  // Rideau noir qui ferme puis rouvre sur chaque ligne au clic, façon flash,
  // et bascule l'état (ouvert/fermé) pendant qu'il est entièrement fermé —
  // le changement de couleur du panneau se fait donc caché derrière.
  const [flashId, setFlashId] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setFlashId(id);
    window.setTimeout(() => {
      setOpenIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }, 220);
    window.setTimeout(() => setFlashId((prev) => (prev === id ? null : prev)), 480);
  };

  const handleCta = () => {
    if (onOpenContact) {
      onOpenContact();
    } else {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="modes" className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 scroll-mt-24">
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

      {/* Accordéon en cascade façon Mondragon : chaque ligne entre au scroll,
          décalée horizontalement. Le survol bascule juste les couleurs en
          négatif ; seul le clic ouvre le panneau (plusieurs peuvent rester
          ouverts en même temps). */}
      <div className="flex flex-col">
        {modes.map((mode, index) => {
          const isOpen = openIds.has(mode.id);
          const isNegative = isOpen || hoveredId === mode.id;
          const cascade = CASCADE[index % CASCADE.length];
          const captionAfter = index === 0;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: index * 0.09, ease: EASE }}
              style={{ zIndex: isOpen ? 50 : index + 1, ['--ml' as string]: cascade.ml, ['--w' as string]: cascade.w } as React.CSSProperties}
              className={`relative w-full sm:ml-[var(--ml)] sm:w-[var(--w)] ${index > 0 ? 'sm:-mt-3' : ''}`}
            >
              <div
                role="button"
                tabIndex={0}
                onMouseEnter={() => {
                  handleHoverStart(mode.id);
                  onHoverItem?.(mode.title.toUpperCase());
                }}
                onMouseLeave={() => {
                  handleHoverEnd();
                  onLeaveItem?.();
                }}
                onClick={() => toggleOpen(mode.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') toggleOpen(mode.id);
                }}
                className={`group relative overflow-hidden rounded-2xl px-6 py-7 text-left shadow-sm transition-colors duration-400 ease-out cursor-pointer sm:rounded-[1.75rem] sm:px-10 sm:py-10 lg:py-12 ${
                  isNegative ? 'bg-black text-white' : 'bg-[#f4f4f4] text-black dark:bg-zinc-900 dark:text-white'
                }`}
              >
                {/* Rideaux noirs : se ferment puis se rouvrent, façon flash, au moment où le panneau change de couleur */}
                <AnimatePresence>
                  {flashId === mode.id && (
                    <>
                      <motion.div
                        key="curtain-top"
                        initial={{ height: 0 }}
                        animate={{ height: '50%' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeIn' }}
                        className="pointer-events-none absolute inset-x-0 top-0 z-30 bg-zinc-950"
                      />
                      <motion.div
                        key="curtain-bottom"
                        initial={{ height: 0 }}
                        animate={{ height: '50%' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeIn' }}
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-zinc-950"
                      />
                    </>
                  )}
                </AnimatePresence>

                <div
                  className={`relative z-0 flex flex-wrap items-baseline gap-x-4 gap-y-1 ${captionAfter ? '' : 'flex-row-reverse justify-end'}`}
                >
                  <h3
                    className="font-space-mono font-bold uppercase text-xl sm:text-3xl lg:text-[44px]"
                    style={{ lineHeight: '1.05', letterSpacing: '-0.03em' }}
                  >
                    {mode.title}
                  </h3>
                  <span
                    className={`font-space-mono font-normal uppercase ${
                      isNegative ? 'text-white/60' : 'text-black/70 dark:text-zinc-500'
                    }`}
                    style={{ fontSize: '13px', lineHeight: '14px', letterSpacing: '0.3px' }}
                  >
                    {mode.caption}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={`ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border sm:h-8 sm:w-8 ${
                      isNegative ? 'border-white/20 text-white' : 'border-zinc-300 text-zinc-950 dark:border-white/15 dark:text-white'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="max-w-2xl pt-6">
                        <p className="text-sm leading-relaxed text-white/75 sm:text-base">{mode.subtitle}</p>

                        <div className="mt-6 border-t border-white/10 pt-4">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/40">
                            {lang === 'fr' ? 'CE QUI EST INCLUS :' : 'DELIVERABLES:'}
                          </span>
                          <ul className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                            {mode.deliverables.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-white/80 sm:text-sm">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                                <span className="leading-snug">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-white/70 sm:text-xs">
                          <span className="font-semibold text-white">{lang === 'fr' ? 'Pour qui ? ' : 'Best for: '}</span>
                          {mode.bestFor}
                        </div>

                        <div className="mt-7 border-t border-white/10 pt-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCta();
                            }}
                            className="group/btn inline-flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-urbanist font-bold text-zinc-950 shadow-xs transition-all hover:bg-zinc-200 active:scale-98 sm:text-sm"
                          >
                            <span>{mode.cta}</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
