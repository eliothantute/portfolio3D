import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Language } from '../types';
import {
  Palette,
  RefreshCw,
  Zap,
  Music,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
gsap.registerPlugin(ScrollTrigger);

interface CollaborationModesProps {
  lang: Language;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

const BRICK_COLS = 6;
const BRICK_ROWS = 4;
const PARTICLE_COUNT = 18;
const WAVE_BAR_COUNT = 16;

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

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Per-card signature entrance effects (desktop pinned sequence only)
  const brushEdgeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const brushContentRef = useRef<HTMLDivElement | null>(null);
  const brickRefs = useRef<Array<HTMLDivElement | null>>([]);
  const particleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const waveBarRefs = useRef<Array<HTMLDivElement | null>>([]);

  const particleSeeds = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 0.3,
      })),
    []
  );

  // Scroll-pin the zoom-through sequence whenever a precise pointer (mouse/
  // trackpad) is available — this is about input precision, not window
  // width, so a narrower desktop browser still gets the full sequence.
  // Touch devices (coarse pointer) keep a normal stacked list instead.
  const [isPinEnabled] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      window.matchMedia('(min-width: 640px)').matches
  );

  const handleCta = () => {
    if (onOpenContact) {
      onOpenContact();
    } else {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useLayoutEffect(() => {
    if (!isPinEnabled || !stageRef.current) return;
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (cards.length < 2) return;

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, scale: 0.84, y: 48, rotationY: 0 });
      gsap.set(cards[0], { opacity: 1, scale: 1, y: 0 });

      // Initial states for each card's signature effect
      const brushEdges = brushEdgeRefs.current.filter((el): el is HTMLDivElement => !!el);
      if (brushEdges.length === 4) {
        gsap.set(brushEdges[0], { scaleX: 0 }); // top
        gsap.set(brushEdges[1], { scaleY: 0 }); // right
        gsap.set(brushEdges[2], { scaleX: 0 }); // bottom
        gsap.set(brushEdges[3], { scaleY: 0 }); // left
      }
      if (brushContentRef.current) {
        gsap.set(brushContentRef.current, { clipPath: 'inset(0 100% 0 0)' });
      }

      const bricks = brickRefs.current.filter((el): el is HTMLDivElement => !!el);
      gsap.set(bricks, { opacity: 1, scaleY: 1 });

      const particles = particleRefs.current.filter((el): el is HTMLDivElement => !!el);
      gsap.set(particles, { opacity: 0, scale: 0 });

      const waveBars = waveBarRefs.current.filter((el): el is HTMLDivElement => !!el);
      gsap.set(waveBars, { scaleY: 0.08 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          end: `+=${(cards.length - 1) * 100}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)));
            setActiveIndex((prev) => (prev === idx ? prev : idx));
          },
        },
      });

      for (let i = 0; i < cards.length - 1; i++) {
        const outgoing = cards[i];
        const incoming = cards[i + 1];
        const nextIndex = i + 1;

        // Generic exit for the card leaving the stage
        tl.to(outgoing, { opacity: 0, scale: 1.1, y: -48, duration: 1, ease: 'power1.inOut' }, i);

        // Signature entrance for the card taking over, keyed to its theme
        switch (nextIndex) {
          case 1: {
            // "Refonte" — brick-by-brick reveal: a solid brick wall sits over
            // the card and clears away in a staggered construction pattern.
            tl.set(incoming, { opacity: 1, scale: 1, y: 0 }, i);
            tl.set(bricks, { opacity: 1, scaleY: 1 }, i);
            tl.to(
              bricks,
              {
                opacity: 0,
                scaleY: 0,
                duration: 0.75,
                ease: 'power1.in',
                stagger: { each: 0.022, grid: [BRICK_ROWS, BRICK_COLS], from: 'start' },
              },
              i + 0.15
            );
            break;
          }
          case 2: {
            // "Animation & 3D" — materializes out of particles while spinning
            // once around the Y axis.
            tl.fromTo(
              incoming,
              { opacity: 0, scale: 0.86, y: 0, rotationY: 0 },
              { opacity: 1, scale: 1, rotationY: 360, duration: 1, ease: 'power1.inOut' },
              i
            );
            tl.fromTo(
              particles,
              { opacity: 0, scale: 0 },
              { opacity: 1, scale: 1, duration: 0.45, stagger: 0.018, ease: 'back.out(2)' },
              i
            ).to(particles, { opacity: 0, duration: 0.35, ease: 'power1.in' }, i + 0.6);
            break;
          }
          case 3: {
            // "Composition Musicale" — an equalizer ripple builds the card in.
            tl.fromTo(incoming, { opacity: 0, scale: 0.9, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power1.inOut' }, i);
            tl.fromTo(
              waveBars,
              { scaleY: 0.08 },
              {
                scaleY: 1,
                duration: 0.5,
                ease: 'power2.out',
                stagger: { each: 0.035, from: 'center' },
                yoyo: true,
                repeat: 1,
              },
              i + 0.1
            );
            break;
          }
          default:
            tl.fromTo(incoming, { opacity: 0, scale: 0.84, y: 48 }, { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power1.inOut' }, i);
        }
      }

      // "Design au Déploiement" is already on stage at rest: give it a
      // one-time brush draw-in as the section is first reached.
      if (brushEdges.length === 4 && brushContentRef.current) {
        const intro = gsap.timeline();
        intro
          .to(brushEdges[0], { scaleX: 1, duration: 0.35, ease: 'power2.out' })
          .to(brushEdges[1], { scaleY: 1, duration: 0.3, ease: 'power2.out' })
          .to(brushEdges[2], { scaleX: 1, duration: 0.35, ease: 'power2.out' })
          .to(brushEdges[3], { scaleY: 1, duration: 0.3, ease: 'power2.out' })
          .to(brushContentRef.current, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power2.inOut' }, '-=0.5');
      }
    }, stageRef);

    return () => ctx.revert();
  }, [isPinEnabled, lang]);

  // Keep ScrollTrigger measurements correct once layout/fonts settle.
  useEffect(() => {
    if (!isPinEnabled) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(id);
  }, [isPinEnabled]);

  const renderCardBody = (mode: (typeof modes)[number], withBrushWrapper: boolean) => {
    const Icon = mode.icon;
    const body = (
      <>
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <span className="font-mono text-sm font-bold text-zinc-400 dark:text-zinc-500">
            {mode.num} //
          </span>
        </div>

        <div className="mt-5">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {mode.badge}
          </span>
          <h3 className="font-urbanist mt-1.5 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white">
            {mode.title}
          </h3>
        </div>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
          {mode.subtitle}
        </p>

        <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {lang === 'fr' ? 'CE QUI EST INCLUS :' : 'DELIVERABLES:'}
          </span>
          <ul className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {mode.deliverables.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-white shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-[11px] sm:text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-white">
            {lang === 'fr' ? 'Pour qui ? ' : 'Best for: '}
          </span>
          {mode.bestFor}
        </div>

        <div className="mt-7 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleCta}
            className="group/btn inline-flex w-full items-center justify-between rounded-xl bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-urbanist font-bold text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-98 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <span>{mode.cta}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </>
    );

    if (!withBrushWrapper) return body;
    return (
      <div ref={brushContentRef} className="h-full w-full">
        {body}
      </div>
    );
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

      {isPinEnabled ? (
        /* Scroll-pinned zoom-through sequence: one mode fills the screen at a
           time, each with a signature entrance tied to its theme. */
        <div ref={stageRef} className="relative h-screen w-full overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center px-4" style={{ perspective: 1600 }}>
            {modes.map((mode, index) => (
              <div
                key={mode.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onMouseEnter={() => onHoverItem?.(mode.title.toUpperCase())}
                onMouseLeave={onLeaveItem}
                className="absolute inset-0 flex items-center justify-center px-4"
                style={{ willChange: 'transform, opacity', transformStyle: 'preserve-3d' }}
              >
                <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/95">
                  {renderCardBody(mode, index === 0)}

                  {/* Card 0: brush-drawn frame */}
                  {index === 0 && (
                    <>
                      <div
                        ref={(el) => {
                          brushEdgeRefs.current[0] = el;
                        }}
                        className="absolute top-0 left-0 h-[3px] w-full origin-left bg-blue-500"
                      />
                      <div
                        ref={(el) => {
                          brushEdgeRefs.current[1] = el;
                        }}
                        className="absolute top-0 right-0 w-[3px] h-full origin-top bg-blue-500"
                      />
                      <div
                        ref={(el) => {
                          brushEdgeRefs.current[2] = el;
                        }}
                        className="absolute bottom-0 right-0 h-[3px] w-full origin-right bg-blue-500"
                      />
                      <div
                        ref={(el) => {
                          brushEdgeRefs.current[3] = el;
                        }}
                        className="absolute bottom-0 left-0 w-[3px] h-full origin-bottom bg-blue-500"
                      />
                    </>
                  )}

                  {/* Card 1: brick-wall reveal overlay */}
                  {index === 1 && (
                    <div
                      className="pointer-events-none absolute inset-0 grid"
                      style={{ gridTemplateColumns: `repeat(${BRICK_COLS}, 1fr)`, gridTemplateRows: `repeat(${BRICK_ROWS}, 1fr)` }}
                    >
                      {Array.from({ length: BRICK_COLS * BRICK_ROWS }, (_, b) => (
                        <div
                          key={b}
                          ref={(el) => {
                            brickRefs.current[b] = el;
                          }}
                          className="origin-center bg-zinc-200 dark:bg-zinc-700"
                          style={{ outline: '1px solid rgba(0,0,0,0.06)' }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Card 2: particle materialization */}
                  {index === 2 && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      {particleSeeds.map((seed, p) => (
                        <div
                          key={p}
                          ref={(el) => {
                            particleRefs.current[p] = el;
                          }}
                          className="absolute h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                          style={{ left: `${seed.left}%`, top: `${seed.top}%` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Card 3: waveform build-in strip */}
                  {index === 3 && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex h-12 items-end justify-center gap-1 overflow-hidden px-8 opacity-70">
                      {Array.from({ length: WAVE_BAR_COUNT }, (_, w) => (
                        <div
                          key={w}
                          ref={(el) => {
                            waveBarRefs.current[w] = el;
                          }}
                          className="w-full origin-bottom rounded-full bg-purple-500"
                          style={{ height: 36 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
            {modes.map((mode, index) => (
              <span
                key={mode.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-6 bg-zinc-950 dark:bg-white' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* 4 Modes Cards Grid (2x2), mobile & coarse-pointer fallback */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {modes.map((mode, index) => (
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
              <div>{renderCardBody(mode, false)}</div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
