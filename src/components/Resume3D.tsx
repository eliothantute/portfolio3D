import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';

interface Resume3DProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
  hideHeader?: boolean;
}

// 5-dot rating indicator
const RatingDots: React.FC<{ value: number; total?: number; size?: 'sm' | 'md' }> = ({
  value,
  total = 5,
  size = 'md',
}) => {
  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';
  return (
    <span className="inline-flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`inline-block rounded-full transition-colors ${dotSize} ${
            i < value ? 'bg-zinc-950' : 'border-2 border-zinc-300 bg-transparent'
          }`}
        />
      ))}
    </span>
  );
};

export const Resume3D: React.FC<Resume3DProps> = ({
  lang,
  onHoverItem,
  onLeaveItem,
  hideHeader = false,
}) => {
  const [viewMode, setViewMode] = useState<'document' | '3d'>('document');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tilt physics for 3D card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || viewMode !== '3d') return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    onLeaveItem?.();
  };

  return (
    <div
      id={hideHeader ? undefined : "cv"}
      className={`relative z-10 w-full [perspective:1400px] ${hideHeader ? "py-2" : "mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-12"}`}
      aria-label={lang === "fr" ? "Curriculum Vitae" : "Resume"}
    >
      {/* Section Header */}
      {!hideHeader && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-center"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-mono font-medium text-zinc-600 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>04 // {lang === "fr" ? "Curriculum Vitae Officiel • Édition 2026" : "Official Resume • 2026 Edition"}</span>
            </div>
            <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
              <InteractiveText
                text={lang === "fr" ? "Curriculum Vitae" : "Curriculum Vitae"}
                hoverColor="#0066ff"
              />
            </h2>
          </div>
        </motion.div>
      )}

      {/* View Switcher & Action Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Dual-View Switcher */}
          <div className="inline-flex items-center rounded-2xl border border-zinc-200 bg-zinc-100/90 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('document')}
              onMouseEnter={() => onHoverItem?.('VUE DOCUMENT LISIBLE')}
              onMouseLeave={onLeaveItem}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'document'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <span>📄</span>
              <span>{lang === 'fr' ? 'Document Lisible HD' : 'Readable Document'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              onMouseEnter={() => onHoverItem?.('VUE 3D HOLOGRAPHIQUE')}
              onMouseLeave={onLeaveItem}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <span>🪐</span>
              <span>{lang === 'fr' ? 'Vue 3D Tilt' : '3D Tilt View'}</span>
            </button>
          </div>

          {/* Download PDF Button */}
          <a
            href="/CV_Eliot_Hantute.pdf"
            download="CV_Eliot_Hantute.pdf"
            onMouseEnter={() => onHoverItem?.('TÉLÉCHARGER CV PDF')}
            onMouseLeave={onLeaveItem}
            className="sneaks-btn-primary py-2.5 px-4 text-xs font-bold shadow-sm"
          >
            <span>{lang === 'fr' ? 'Télécharger PDF' : 'Download PDF'}</span>
            <span>↓</span>
          </a>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            onMouseEnter={() => onHoverItem?.('PLEIN ÉCRAN')}
            onMouseLeave={onLeaveItem}
            className="sneaks-btn-secondary py-2.5 px-4 text-xs font-bold shadow-sm cursor-pointer"
          >
            <span>{lang === 'fr' ? 'Plein Écran' : 'Fullscreen'}</span>
            <span>⛶</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Ultra-Readable HD Document View (Default) */}
      {viewMode === 'document' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-950/5"
        >
          {/* Black Header Banner */}
          <div className="bg-[#09090b] px-8 py-8 text-white sm:px-12 sm:py-10">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-zinc-800 pb-5">
              <h3 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white">
                Eliot Hantute
              </h3>
              <div className="flex items-baseline gap-3">
                <span className="text-zinc-500 text-xl font-light">/</span>
                <div>
                  <span className="font-display text-lg sm:text-xl font-bold text-white">Développeur Front-End</span>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    CREATIVE DEVELOPER
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-zinc-300 font-normal">
              Développeur front-end, musicien et cuistot pro, j'applique la même exigence au code qu'à une partition ou une recette : sens du rythme, dosage des composants et exécution millimétrée. Spécialisé en React, TypeScript et Three.js, je conçois des interfaces modulaires et des expériences immersives où fluidité visuelle et rigueur technique ne font qu'un.
            </p>
          </div>

          {/* Main Document Content: 2 Columns */}
          <div className="grid grid-cols-12 gap-8 p-8 sm:p-12">
            {/* Left Column (4/12) */}
            <div className="col-span-12 md:col-span-4 border-b md:border-b-0 md:border-r border-zinc-200 pb-8 md:pb-0 md:pr-8 space-y-8">
              {/* CONTACT */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1.5">
                  CONTACT
                </h4>
                <div className="mt-4 space-y-2 text-sm text-zinc-700">
                  <p className="flex items-center gap-2">
                    <span className="text-zinc-400">📍</span>
                    <span>Paris, France</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-zinc-400">📞</span>
                    <a href="tel:+33775036875" className="hover:text-zinc-950 transition-colors">
                      +33 7 75 03 68 75
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-zinc-400">✉️</span>
                    <a href="mailto:eliot.hantute@gmail.com" className="font-semibold text-zinc-950 underline hover:text-blue-600 transition-colors">
                      eliot.hantute@gmail.com
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-zinc-400">🌐</span>
                    <a href="https://eliotlab.fr" target="_blank" rel="noreferrer" className="font-semibold text-zinc-950 underline hover:text-blue-600 transition-colors">
                      eliotlab.fr
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-zinc-400">💻</span>
                    <a href="https://github.com/eliothantute" target="_blank" rel="noreferrer" className="font-semibold text-zinc-950 underline hover:text-blue-600 transition-colors">
                      github.com/eliothantute
                    </a>
                  </p>
                </div>
              </div>

              {/* FORMATION */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1.5">
                  FORMATION
                </h4>
                <div className="mt-4 space-y-5 text-sm text-zinc-700">
                  <div>
                    <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase">En cours</span>
                    <p className="font-bold text-zinc-950 text-base">Product Designer</p>
                    <p className="text-zinc-600 font-medium text-xs">RNCP Niv. 6 — Bac +3/4</p>
                    <p className="text-zinc-500 text-xs">OpenClassrooms</p>
                  </div>

                  <div>
                    <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase">2025</span>
                    <p className="font-bold text-zinc-950 text-base leading-snug">BUT Info-Communication</p>
                    <p className="text-zinc-600 font-medium text-xs">Stratégie Digitale</p>
                    <p className="text-zinc-500 text-xs">IUT Haguenau / Univ. Strasbourg</p>
                  </div>

                  <div>
                    <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase">2015</span>
                    <p className="font-bold text-zinc-950 text-base">Bac STD2A</p>
                    <p className="text-zinc-600 font-medium text-xs">Design &amp; Arts Appliqués</p>
                    <p className="text-zinc-500 text-xs">Paris 6e</p>
                  </div>
                </div>
              </div>

              {/* LANGUES */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1.5">
                  LANGUES
                </h4>
                <div className="mt-4 space-y-3 text-sm text-zinc-800">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-zinc-950">Français</span>
                      <span className="font-mono text-xs text-zinc-500">Natif</span>
                    </div>
                    <RatingDots value={5} size="md" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-zinc-950">Anglais</span>
                      <span className="font-mono text-xs text-zinc-500">C1</span>
                    </div>
                    <RatingDots value={4} size="md" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-zinc-950">Italien</span>
                      <span className="font-mono text-xs text-zinc-500">A2</span>
                    </div>
                    <RatingDots value={2} size="md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (8/12) */}
            <div className="col-span-12 md:col-span-8 space-y-8">
              {/* EXPÉRIENCES PROFESSIONNELLES */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1.5">
                  EXPÉRIENCES PROFESSIONNELLES
                </h4>

                <div className="mt-5 space-y-6">
                  {/* Exp 1: Développeur Front-End */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-4">
                      <p className="font-bold text-zinc-950 text-base leading-tight">Développeur Front-End</p>
                      <p className="text-xs text-zinc-500 font-medium">Freelance</p>
                      <p className="text-xs font-bold text-zinc-900">Eliot Lab</p>
                      <p className="font-mono text-xs font-semibold text-zinc-500 mt-1">2026 – Présent</p>
                    </div>
                    <ul className="col-span-12 sm:col-span-8 space-y-2 text-sm text-zinc-700 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-950 font-bold text-base leading-none">›</span>
                        <span><strong className="text-zinc-950">Atelier Berger</strong> — Globe 3D interactif (Three.js, React Globe GL), rendu WebGL 60 FPS stable.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-950 font-bold text-base leading-none">›</span>
                        <span><strong className="text-zinc-950">Hazi App</strong> — Plateforme IA agentique, LCP &lt; 1.2s, Lighthouse 95+, micro-animations scroll.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-950 font-bold text-base leading-none">›</span>
                        <span><strong className="text-zinc-950">Les Humanités</strong> — Refonte media indépendant, SSG/ISR Next.js, référencement maximisé.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-950 font-bold text-base leading-none">›</span>
                        <span><strong className="text-zinc-950">Aum Paris</strong> — Showcase e-commerce luxe pixel-perfect, CLS: 0, 100% mobile-first.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-950 font-bold text-base leading-none">›</span>
                        <span><strong className="text-zinc-950">Nari OS</strong> — Environnement fenêtré interactif, gestion d'états avancée clavier/souris.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Exp 2: Intégrateur Web */}
                  <div className="grid grid-cols-12 gap-4 border-t border-zinc-200 pt-5">
                    <div className="col-span-12 sm:col-span-4">
                      <p className="font-bold text-zinc-950 text-base leading-tight">Intégrateur Web</p>
                      <p className="text-xs text-zinc-500 font-medium">Freelance</p>
                      <p className="text-xs font-bold text-zinc-900">Missions indépendantes</p>
                      <p className="font-mono text-xs font-semibold text-zinc-500 mt-1">2025</p>
                    </div>
                    <ul className="col-span-12 sm:col-span-8 space-y-2 text-sm text-zinc-700 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-950 font-bold text-base leading-none">›</span>
                        <span><strong className="text-zinc-950">Centre de Neuro-Pédagogie</strong> — Refonte HTML5/CSS/JS vanilla, audit perf &amp; accessibilité.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-950 font-bold text-base leading-none">›</span>
                        <span><strong className="text-zinc-950">Le Comité du Souvenir Français</strong> — Intégration Figma → code, déploiement CI/CD.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* COMPÉTENCES & EXPERTISE */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1.5">
                  COMPÉTENCES &amp; EXPERTISE
                </h4>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                  {[
                    { name: 'TypeScript', dots: 5 },
                    { name: 'React / Next.js', dots: 5 },
                    { name: 'Three.js / WebGL', dots: 4 },
                    { name: 'CSS / Tailwind', dots: 5 },
                    { name: 'Figma / Design', dots: 4 },
                    { name: 'GSAP / Animation', dots: 4 },
                    { name: 'Git / CI/CD', dots: 4 },
                    { name: 'Performance Web', dots: 5 },
                    { name: 'HTML5 Sémantique', dots: 5 },
                    { name: 'Vite / Webpack', dots: 4 },
                    { name: 'Framer Motion', dots: 4 },
                    { name: 'A11y / WCAG', dots: 3 },
                    { name: 'Vercel / Deploy', dots: 4 },
                    { name: 'PWA', dots: 3 },
                    { name: 'GLSL Shaders', dots: 3 },
                    { name: 'Atomic Design', dots: 4 },
                  ].map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                      <span className="font-medium text-zinc-800">{skill.name}</span>
                      <RatingDots value={skill.dots} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Line */}
          <div className="flex items-center justify-between bg-zinc-900 px-8 py-3.5 text-xs font-mono tracking-widest text-zinc-400">
            <span>ELIOT HANTUTE — CV 2026</span>
            <span>ELIOTLAB.FR</span>
          </div>
        </motion.div>
      )}

      {/* VIEW 2: 3D Holographic Tilt View (Enlarged + Zoom Controls) */}
      {viewMode === '3d' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex flex-col items-center justify-center [perspective:1400px]"
        >
          {/* Zoom & Control Bar */}
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-full border border-zinc-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md">
            <span className="font-mono text-xs text-zinc-500">Zoom carte :</span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(0.85, zoomLevel - 0.15))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 font-mono text-xs font-bold hover:bg-zinc-200 cursor-pointer"
            >
              -
            </button>
            <span className="font-mono text-xs font-bold text-zinc-800 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.15))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 font-mono text-xs font-bold hover:bg-zinc-200 cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-xs hover:bg-zinc-200 cursor-pointer text-zinc-600"
            >
              Reset
            </button>
            <div className="h-4 w-px bg-zinc-200 mx-1" />
            <a
              href="/cv-3d.html"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs font-semibold text-blue-600 hover:underline"
            >
              Ouvrir visualiseur WebGL 3D complet ↗
            </a>
          </div>

          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => onHoverItem?.('CV 3D // CLIQUEZ POUR AGRANDIR')}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsModalOpen(true)}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              scale: zoomLevel,
            }}
            whileHover={{ scale: zoomLevel * 1.02 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="group relative w-full max-w-3xl cursor-pointer overflow-hidden rounded-[2rem] border border-zinc-300 bg-white [transform-style:preserve-3d] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.18)] hover:shadow-[0_35px_90px_-15px_rgba(0,0,0,0.25)] transition-shadow duration-300"
          >
            {/* Dynamic Specular Glare Reflection */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle 500px at ${glareX}% ${glareY}%, rgba(255,255,255,0.7), transparent 75%)`,
              }}
            />

            {/* Click to Enlarge Badge Overlay on Hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-12 z-40 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="rounded-full bg-zinc-950/90 px-5 py-2 font-mono text-xs font-bold text-white shadow-xl backdrop-blur-md">
                🔍 Cliquez pour agrandir en Plein Écran HD
              </span>
            </div>

            {/* Document Content Inside 3D Card */}
            <div className="relative z-10 select-none text-zinc-900">
              {/* Header Banner */}
              <div className="bg-[#09090b] px-7 py-7 text-white sm:px-9 sm:py-8">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800 pb-4">
                  <h4 className="font-display text-2xl sm:text-4xl font-black tracking-tight text-white">
                    Eliot Hantute
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-zinc-500">/</span>
                    <div>
                      <span className="font-display text-sm sm:text-base font-bold text-white">Développeur Front-End</span>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        CREATIVE DEVELOPER
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-3.5 text-[11px] sm:text-xs leading-relaxed text-zinc-300">
                  Développeur front-end, musicien et cuistot pro, j'applique la même exigence au code qu'à une partition ou une recette : sens du rythme, dosage des composants et exécution millimétrée. Spécialisé en React, TypeScript et Three.js, je conçois des interfaces modulaires et des expériences immersives où fluidité visuelle et rigueur technique ne font qu'un.
                </p>
              </div>

              {/* Main Body: 2 Columns */}
              <div className="grid grid-cols-12 gap-6 p-7 text-xs sm:p-9 sm:text-sm">
                {/* Left Column */}
                <div className="col-span-4 border-r border-zinc-200 pr-4 space-y-5">
                  <div>
                    <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      CONTACT
                    </h5>
                    <div className="mt-2.5 space-y-1 text-zinc-700 text-[11px] sm:text-xs">
                      <p>Paris, France</p>
                      <p>+33 7 75 03 68 75</p>
                      <p className="font-semibold underline text-zinc-950 truncate">eliot.hantute@gmail.com</p>
                      <p className="font-semibold underline text-zinc-950">eliotlab.fr</p>
                      <p className="font-semibold underline text-zinc-950 truncate">github.com/eliothantute</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      FORMATION
                    </h5>
                    <div className="mt-2.5 space-y-3 text-zinc-700 text-[11px] sm:text-xs">
                      <div>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">En cours</span>
                        <p className="font-bold text-zinc-950 text-xs">Product Designer</p>
                        <p className="text-[10px] text-zinc-600">RNCP Niv. 6 — Bac +3/4</p>
                        <p className="text-[10px] text-zinc-500">OpenClassrooms</p>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">2025</span>
                        <p className="font-bold text-zinc-950 text-xs leading-snug">BUT Info-Communication</p>
                        <p className="text-[10px] text-zinc-600">Stratégie Digitale</p>
                        <p className="text-[10px] text-zinc-500">IUT Haguenau / Univ. Strasbourg</p>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">2015</span>
                        <p className="font-bold text-zinc-950 text-xs">Bac STD2A</p>
                        <p className="text-[10px] text-zinc-600">Design &amp; Arts Appliqués</p>
                        <p className="text-[10px] text-zinc-500">Paris 6e</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      LANGUES
                    </h5>
                    <div className="mt-2.5 space-y-2 text-zinc-800 text-[11px] sm:text-xs">
                      <div>
                        <div className="flex justify-between">
                          <span className="font-bold">Français</span>
                          <span className="font-mono text-[10px] text-zinc-500">Natif</span>
                        </div>
                        <RatingDots value={5} size="sm" />
                      </div>

                      <div>
                        <div className="flex justify-between">
                          <span className="font-bold">Anglais</span>
                          <span className="font-mono text-[10px] text-zinc-500">C1</span>
                        </div>
                        <RatingDots value={4} size="sm" />
                      </div>

                      <div>
                        <div className="flex justify-between">
                          <span className="font-bold">Italien</span>
                          <span className="font-mono text-[10px] text-zinc-500">A2</span>
                        </div>
                        <RatingDots value={2} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-span-8 space-y-5 pl-2">
                  <div>
                    <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      EXPÉRIENCES PROFESSIONNELLES
                    </h5>

                    <div className="mt-3 space-y-3.5">
                      <div className="grid grid-cols-12 gap-2 text-[11px] sm:text-xs">
                        <div className="col-span-4">
                          <p className="font-bold text-zinc-950 leading-tight">Développeur Front-End</p>
                          <p className="text-zinc-500">Freelance</p>
                          <p className="font-bold text-zinc-900">Eliot Lab</p>
                          <p className="font-mono text-[10px] text-zinc-500">2026 – Présent</p>
                        </div>
                        <ul className="col-span-8 space-y-1 text-zinc-700 leading-snug">
                          <li>› <strong className="text-zinc-950">Atelier Berger</strong> — Globe 3D interactif (Three.js), 60 FPS stable.</li>
                          <li>› <strong className="text-zinc-950">Hazi App</strong> — Plateforme IA agentique, LCP &lt; 1.2s, Lighthouse 95+.</li>
                          <li>› <strong className="text-zinc-950">Les Humanités</strong> — Refonte media indépendant, SSG/ISR Next.js.</li>
                          <li>› <strong className="text-zinc-950">Aum Paris</strong> — Showcase e-commerce luxe pixel-perfect.</li>
                          <li>› <strong className="text-zinc-950">Nari OS</strong> — Environnement fenêtré interactif.</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-12 gap-2 border-t border-zinc-100 pt-2.5 text-[11px] sm:text-xs">
                        <div className="col-span-4">
                          <p className="font-bold text-zinc-950 leading-tight">Intégrateur Web</p>
                          <p className="text-zinc-500">Freelance</p>
                          <p className="font-bold text-zinc-700">Missions indép.</p>
                          <p className="font-mono text-[10px] text-zinc-500">2025</p>
                        </div>
                        <ul className="col-span-8 space-y-1 text-zinc-700 leading-snug">
                          <li>› <strong className="text-zinc-950">Centre de Neuro-Pédagogie</strong> — Refonte HTML5/CSS/JS vanilla, perf.</li>
                          <li>› <strong className="text-zinc-950">Le Comité du Souvenir Français</strong> — Intégration Figma → code.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      COMPÉTENCES &amp; EXPERTISE
                    </h5>

                    <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] sm:text-[11px]">
                      {[
                        { name: 'TypeScript', dots: 5 },
                        { name: 'React / Next.js', dots: 5 },
                        { name: 'Three.js / WebGL', dots: 4 },
                        { name: 'CSS / Tailwind', dots: 5 },
                        { name: 'Figma / Design', dots: 4 },
                        { name: 'GSAP / Animation', dots: 4 },
                        { name: 'Git / CI/CD', dots: 4 },
                        { name: 'Performance Web', dots: 5 },
                        { name: 'HTML5 Sémantique', dots: 5 },
                        { name: 'Vite / Webpack', dots: 4 },
                        { name: 'Framer Motion', dots: 4 },
                        { name: 'A11y / WCAG', dots: 3 },
                        { name: 'Vercel / Deploy', dots: 4 },
                        { name: 'PWA', dots: 3 },
                        { name: 'GLSL Shaders', dots: 3 },
                        { name: 'Atomic Design', dots: 4 },
                      ].map((s) => (
                        <div key={s.name} className="flex items-center justify-between">
                          <span className="font-medium text-zinc-800 truncate pr-1">{s.name}</span>
                          <RatingDots value={s.dots} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Line */}
              <div className="flex items-center justify-between bg-zinc-900 px-7 py-2.5 text-[10px] font-mono tracking-widest text-zinc-400">
                <span>ELIOT HANTUTE — CV 2026</span>
                <span>ELIOTLAB.FR</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Fullscreen HD Document Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl text-zinc-900"
          >
            {/* Modal Top Floating Bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-4 backdrop-blur-md sm:px-8">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  CV 2026 // Format Officiel A4 Plein Écran
                </span>
                <h3 className="font-display text-xl font-bold text-zinc-950 sm:text-2xl">
                  Eliot Hantute — Développeur Front-End
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/CV_Eliot_Hantute.pdf"
                  download="CV_Eliot_Hantute.pdf"
                  className="sneaks-btn-primary py-2 px-4 text-xs font-bold"
                >
                  Télécharger PDF ↓
                </a>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 font-mono text-sm text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body Inside Modal */}
            <div className="p-6 sm:p-10">
              <div className="rounded-2xl bg-[#09090b] p-6 text-white sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800 pb-4">
                  <h4 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white">
                    Eliot Hantute
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-zinc-500 text-lg">/</span>
                    <div>
                      <span className="font-display text-lg font-bold text-white">Développeur Front-End</span>
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        CREATIVE DEVELOPER
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-300">
                  Développeur front-end, musicien et cuistot pro, j'applique la même exigence au code qu'à une partition ou une recette : sens du rythme, dosage des composants et exécution millimétrée. Spécialisé en React, TypeScript et Three.js, je conçois des interfaces modulaires et des expériences immersives où fluidité visuelle et rigueur technique ne font qu'un.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-12 gap-8 text-sm leading-relaxed">
                {/* Left Column */}
                <div className="col-span-12 sm:col-span-4 border-r-0 sm:border-r border-zinc-200 pr-0 sm:pr-6 space-y-6">
                  <div>
                    <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      CONTACT
                    </h5>
                    <div className="mt-3 space-y-1.5 text-zinc-700">
                      <p>Paris, France</p>
                      <p>+33 7 75 03 68 75</p>
                      <p className="font-semibold underline text-zinc-950">eliot.hantute@gmail.com</p>
                      <p className="font-semibold underline text-zinc-950">eliotlab.fr</p>
                      <p className="font-semibold underline text-zinc-950">github.com/eliothantute</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      FORMATION
                    </h5>
                    <div className="mt-3 space-y-4 text-zinc-700">
                      <div>
                        <span className="font-mono text-[10px] text-zinc-500 uppercase">En cours</span>
                        <p className="font-bold text-zinc-950 text-base">Product Designer</p>
                        <p className="text-zinc-600 text-xs">RNCP Niv. 6 — Bac +3/4</p>
                        <p className="text-zinc-500 text-xs">OpenClassrooms</p>
                      </div>

                      <div>
                        <span className="font-mono text-[10px] text-zinc-500 uppercase">2025</span>
                        <p className="font-bold text-zinc-950 text-base">BUT Info-Communication</p>
                        <p className="text-zinc-600 text-xs">Stratégie Digitale</p>
                        <p className="text-zinc-500 text-xs">IUT Haguenau / Univ. Strasbourg</p>
                      </div>

                      <div>
                        <span className="font-mono text-[10px] text-zinc-500 uppercase">2015</span>
                        <p className="font-bold text-zinc-950 text-base">Bac STD2A</p>
                        <p className="text-zinc-600 text-xs">Design &amp; Arts Appliqués</p>
                        <p className="text-zinc-500 text-xs">Paris 6e</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      LANGUES
                    </h5>
                    <div className="mt-3 space-y-3 text-zinc-800">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">Français</span>
                          <span className="font-mono text-xs text-zinc-500">Natif</span>
                        </div>
                        <RatingDots value={5} size="md" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">Anglais</span>
                          <span className="font-mono text-xs text-zinc-500">C1</span>
                        </div>
                        <RatingDots value={4} size="md" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">Italien</span>
                          <span className="font-mono text-xs text-zinc-500">A2</span>
                        </div>
                        <RatingDots value={2} size="md" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-span-12 sm:col-span-8 space-y-6">
                  <div>
                    <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      EXPÉRIENCES PROFESSIONNELLES
                    </h5>

                    <div className="mt-4 space-y-5">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 sm:col-span-4">
                          <p className="font-bold text-zinc-950 text-base leading-tight">Développeur Front-End</p>
                          <p className="text-zinc-500 text-xs">Freelance</p>
                          <p className="font-semibold text-zinc-900 text-xs">Eliot Lab</p>
                          <p className="font-mono text-xs text-zinc-500">2026 – Présent</p>
                        </div>
                        <ul className="col-span-12 sm:col-span-8 space-y-2 text-zinc-700 text-sm leading-relaxed">
                          <li>› <strong className="text-zinc-950">Atelier Berger</strong> — Globe 3D interactif (Three.js, React Globe GL), rendu WebGL 60 FPS stable.</li>
                          <li>› <strong className="text-zinc-950">Hazi App</strong> — Plateforme IA agentique, LCP &lt; 1.2s, Lighthouse 95+, micro-animations scroll.</li>
                          <li>› <strong className="text-zinc-950">Les Humanités</strong> — Refonte media indépendant, SSG/ISR Next.js, référencement maximisé.</li>
                          <li>› <strong className="text-zinc-950">Aum Paris</strong> — Showcase e-commerce luxe pixel-perfect, CLS: 0, 100% mobile-first.</li>
                          <li>› <strong className="text-zinc-950">Nari OS</strong> — Environnement fenêtré interactif, gestion d'états avancée clavier/souris.</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-12 gap-3 border-t border-zinc-200 pt-4">
                        <div className="col-span-12 sm:col-span-4">
                          <p className="font-bold text-zinc-950 text-base leading-tight">Intégrateur Web</p>
                          <p className="text-zinc-500 text-xs">Freelance</p>
                          <p className="text-zinc-700 text-xs">Missions indépendantes</p>
                          <p className="font-mono text-xs text-zinc-500">2025</p>
                        </div>
                        <ul className="col-span-12 sm:col-span-8 space-y-2 text-zinc-700 text-sm leading-relaxed">
                          <li>› <strong className="text-zinc-950">Centre de Neuro-Pédagogie</strong> — Refonte HTML5/CSS/JS vanilla, audit perf &amp; accessibilité.</li>
                          <li>› <strong className="text-zinc-950">Le Comité du Souvenir Français</strong> — Intégration Figma → code, déploiement CI/CD.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 border-b-2 border-zinc-950 pb-1">
                      COMPÉTENCES &amp; EXPERTISE
                    </h5>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                      {[
                        { name: 'TypeScript', dots: 5 },
                        { name: 'React / Next.js', dots: 5 },
                        { name: 'Three.js / WebGL', dots: 4 },
                        { name: 'CSS / Tailwind', dots: 5 },
                        { name: 'Figma / Design', dots: 4 },
                        { name: 'GSAP / Animation', dots: 4 },
                        { name: 'Git / CI/CD', dots: 4 },
                        { name: 'Performance Web', dots: 5 },
                        { name: 'HTML5 Sémantique', dots: 5 },
                        { name: 'Vite / Webpack', dots: 4 },
                        { name: 'Framer Motion', dots: 4 },
                        { name: 'A11y / WCAG', dots: 3 },
                        { name: 'Vercel / Deploy', dots: 4 },
                        { name: 'PWA', dots: 3 },
                        { name: 'GLSL Shaders', dots: 3 },
                        { name: 'Atomic Design', dots: 4 },
                      ].map((s) => (
                        <div key={s.name} className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                          <span className="font-medium text-zinc-800">{s.name}</span>
                          <RatingDots value={s.dots} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between rounded-xl bg-zinc-900 px-8 py-3 text-xs font-mono tracking-widest text-zinc-400">
                <span>ELIOT HANTUTE — CV 2026</span>
                <span>ELIOTLAB.FR</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
