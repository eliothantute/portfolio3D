import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';

interface Resume3DProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Resume3D: React.FC<Resume3DProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tilt physics for 3D card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
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
    <section
      id="cv"
      className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-8 lg:px-12 [perspective:1400px]"
      aria-label={lang === 'fr' ? 'Curriculum Vitae 3D' : '3D Resume'}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-14 flex flex-col items-start justify-between gap-4 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end"
      >
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            {lang === 'fr' ? 'Curriculum Vitae // Officiel' : 'Official Resume / CV // 2026'}
          </span>
          <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
            <InteractiveText
              text={lang === 'fr' ? 'Mon CV en 3D Interactif' : 'Interactive 3D Resume'}
              hoverColor="#0066ff"
            />
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-zinc-500 sm:text-right">
          {lang === 'fr'
            ? 'Explorez le document en 3D temps réel avec physique d’inclinaison ou téléchargez la version PDF originale.'
            : 'Explore the document in real-time 3D with tilt physics or download the original PDF version.'}
        </p>
      </motion.div>

      {/* Big 3D Showcase Grid */}
      <div className="grid items-center gap-12 lg:grid-cols-12">
        {/* Left Side: Summary, Highlights & Actions */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 lg:col-span-5"
        >
          {/* Overview Card */}
          <div className="sneaks-card rounded-3xl p-7">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Profil Candidat
            </span>
            <h3 className="font-display mt-1 text-2xl font-bold text-zinc-950">
              Eliot Hantute
            </h3>
            <p className="font-mono text-xs font-semibold text-blue-600">
              UI Designer &amp; Front-End Developer Junior
            </p>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              {lang === 'fr'
                ? "Designer UI & développeur front-end, je conçois des interfaces sur Figma et je les développe moi-même avec React, Next.js et Three.js — du wireframe à la mise en production."
                : 'UI Designer & front-end developer specialized in React, Next.js and Three.js — from Figma wireframes to production deployment.'}
            </p>

            {/* Quick Skills List */}
            <div className="mt-6 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-4">
              {['Figma', 'Framer', 'React', 'Next.js', 'Three.js / R3F', 'Tailwind CSS', 'TypeScript', 'LLMs & IA'].map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons Box */}
          <div className="flex flex-col gap-3">
            <a
              href="/CV_Eliot_Hantute.pdf"
              download="CV_Eliot_Hantute.pdf"
              onMouseEnter={() => onHoverItem?.('TÉLÉCHARGER LE CV PDF')}
              onMouseLeave={onLeaveItem}
              className="sneaks-btn-primary w-full py-4 text-sm text-center justify-center font-bold shadow-md"
            >
              <span>{lang === 'fr' ? 'Télécharger le CV officiel (PDF)' : 'Download Official Resume (PDF)'}</span>
              <span>↓</span>
            </a>

            <a
              href="/cv-3d.html"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => onHoverItem?.('OUVRIR EN PLEIN ÉCRAN 3D')}
              onMouseLeave={onLeaveItem}
              className="sneaks-btn-secondary w-full py-3.5 text-xs text-center justify-center font-semibold"
            >
              <span>{lang === 'fr' ? 'Ouvrir la visionneuse 3D plein écran' : 'Open Fullscreen 3D Viewer'}</span>
              <span>↗</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Document PDF A4 original (29 Ko) • Prêt à imprimer</span>
          </div>
        </motion.div>

        {/* Right Side: Big Grand 3D Interactive Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex justify-center [perspective:1400px]"
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => onHoverItem?.(lang === 'fr' ? 'CV 3D // CLIQUEZ POUR AGRANDIR' : '3D CV // CLICK TO ENLARGE')}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsModalOpen(true)}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="sneaks-card group relative w-full max-w-[580px] cursor-pointer rounded-[2rem] p-6 sm:p-8 [transform-style:preserve-3d] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_35px_85px_-15px_rgba(0,0,0,0.16)]"
          >
            {/* Dynamic Specular Glare Reflection */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle 420px at ${glareX}% ${glareY}%, rgba(255,255,255,0.9), transparent 75%)`,
              }}
            />

            {/* Document Surface */}
            <div className="relative z-10 select-none text-zinc-900">
              {/* Document Top */}
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h4 className="font-display text-2xl font-extrabold tracking-tight text-zinc-950 leading-none">
                    ELIOT HANTUTE
                  </h4>
                  <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    UI DESIGNER &amp; FRONT-END DEVELOPER JUNIOR
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-[9px] font-semibold text-zinc-700">
                  Paris, FR
                </span>
              </div>

              {/* 2-Column Exact Document Layout */}
              <div className="mt-4 grid grid-cols-12 gap-5 text-[10px]">
                {/* Left Document Column */}
                <div className="col-span-5 border-r border-zinc-100 pr-3 space-y-4">
                  {/* Contact */}
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Contact
                    </span>
                    <p className="mt-1 truncate text-[9.5px] text-zinc-700">eliot.hantute@gmail.com</p>
                    <p className="text-[9.5px] text-zinc-700">+33 7 75 03 68 75</p>
                    <p className="text-[9.5px] font-mono text-blue-600">eliotlab.fr</p>
                  </div>

                  {/* UI/UX Design */}
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      UI / UX Design
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {['Figma', 'Framer', 'Prototypage', 'Design System', 'Photoshop', 'Illustrator'].map((s) => (
                        <span
                          key={s}
                          className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[8px] font-medium text-zinc-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Développement */}
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Développement
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {['React', 'Next.js', 'Three.js', 'Tailwind CSS', 'JavaScript', 'HTML5/CSS3'].map((s) => (
                        <span
                          key={s}
                          className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[8px] font-medium text-zinc-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Soft Skills */}
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Soft Skills
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {['Créativité', 'Autonomie', 'Initiative', 'Travail en équipe', 'Adaptabilité'].map((s) => (
                        <span
                          key={s}
                          className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[8px] font-medium text-zinc-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Langues */}
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Langues
                    </span>
                    <div className="mt-1 space-y-0.5 text-[9px] text-zinc-700">
                      <div className="flex justify-between">
                        <span>Français</span>
                        <span className="text-zinc-400">Natif</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anglais</span>
                        <span className="text-zinc-400">Avancé (C1)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Italien</span>
                        <span className="text-zinc-400">Débutant (A2)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Document Column */}
                <div className="col-span-7 space-y-4 pl-1">
                  {/* Profil */}
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Profil
                    </span>
                    <p className="mt-1 line-clamp-4 text-[9px] leading-relaxed text-zinc-600">
                      Designer UI &amp; développeur front-end, je conçois des interfaces sur Figma et je les développe moi-même avec React, Next.js et Three.js — du wireframe à la mise en production. J'aime particulièrement les expériences web immersives et interactives.
                    </p>
                  </div>

                  {/* Expériences Professionnelles */}
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Expériences Professionnelles
                    </span>
                    <div className="mt-1.5 space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-zinc-950">
                          <span>UI Designer — L’Atelier Berger</span>
                          <span className="text-[8px] font-mono text-zinc-500 font-medium">2026 — Présent</span>
                        </div>
                        <p className="text-[8.5px] text-zinc-600 line-clamp-1">
                          Globe 3D interactif avec navigation dynamique (React, Three.js).
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-zinc-950">
                          <span>UI Designer — Ping Paris</span>
                          <span className="text-[8px] font-mono text-zinc-500 font-medium">2026</span>
                        </div>
                        <p className="text-[8.5px] text-zinc-600 line-clamp-1">
                          Application web géolocalisation tables &amp; UI complète Figma.
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-zinc-950">
                          <span>UI Designer — Neuro-Pédagogie</span>
                          <span className="text-[8px] font-mono text-zinc-500 font-medium">2025</span>
                        </div>
                        <p className="text-[8.5px] text-zinc-600 line-clamp-1">
                          Refonte de site vitrine, SEO on-page &amp; intégration front.
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-zinc-950">
                          <span>Web Designer — Souvenir Français</span>
                          <span className="text-[8px] font-mono text-zinc-500 font-medium">2025</span>
                        </div>
                        <p className="text-[8.5px] text-zinc-600 line-clamp-1">
                          Prototypes haute-fidélité sur Figma &amp; Framer.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formations */}
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Formations
                    </span>
                    <div className="mt-1 grid grid-cols-2 gap-1.5 text-[8.5px]">
                      <div className="rounded-lg bg-zinc-50 p-1.5 border border-zinc-100">
                        <p className="font-bold text-zinc-950">Product Designer</p>
                        <p className="text-[8px] text-zinc-500 font-medium">OpenClassrooms 2026</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 p-1.5 border border-zinc-100">
                        <p className="font-bold text-zinc-950">BUT Info-Com</p>
                        <p className="text-[8px] text-zinc-500 font-medium">Univ. Strasbourg 2025</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 p-1.5 border border-zinc-100">
                        <p className="font-bold text-zinc-950">Production Sonore</p>
                        <p className="text-[8px] text-zinc-500 font-medium">Montréal 2017</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 p-1.5 border border-zinc-100">
                        <p className="font-bold text-zinc-950">STD2A</p>
                        <p className="text-[8px] text-zinc-500 font-medium">Paris 6e 2015</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Cue */}
              <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px]">
                <span className="font-mono text-[9.5px] text-zinc-400 group-hover:text-blue-600 transition-colors">
                  {lang === 'fr' ? '⤢ Cliquer pour agrandir le CV en plein écran' : '⤢ Click to enlarge full document'}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 font-bold group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                  ↗
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Fullscreen HD Document Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-10 shadow-2xl text-zinc-900"
          >
            {/* Modal Top Bar */}
            <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Document Officiel Original
                </span>
                <h3 className="font-display text-2xl font-bold text-zinc-950">
                  CV — Eliot Hantute
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 font-mono text-sm text-zinc-600 hover:bg-zinc-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="grid grid-cols-12 gap-8 text-xs leading-relaxed">
              {/* Left Column */}
              <div className="col-span-12 sm:col-span-4 border-r-0 sm:border-r border-zinc-100 pr-0 sm:pr-6 space-y-6">
                <div>
                  <h4 className="font-display text-2xl font-extrabold text-zinc-950">ELIOT HANTUTE</h4>
                  <p className="mt-1 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                    UI Designer &amp; Front-End Developer Junior
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-xs font-bold uppercase text-zinc-400">Contact</p>
                  <p className="text-zinc-700">📍 Paris, France</p>
                  <p className="text-zinc-700">✉️ eliot.hantute@gmail.com</p>
                  <p className="text-zinc-700">📞 +33 7 75 03 68 75</p>
                  <p className="font-mono text-blue-600">🌐 eliotlab.fr</p>
                </div>

                <div className="space-y-2">
                  <p className="font-mono text-xs font-bold uppercase text-zinc-400">UI / UX Design</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Figma', 'Framer', 'Prototypage', 'Design System', 'Photoshop', 'Illustrator'].map((s) => (
                      <span key={s} className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-mono text-xs font-bold uppercase text-zinc-400">Développement</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'Next.js', 'Three.js / R3F', 'Tailwind CSS', 'TypeScript', 'HTML5 / CSS3'].map((s) => (
                      <span key={s} className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-mono text-xs font-bold uppercase text-zinc-400">Soft Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Créativité', 'Autonomie', 'Initiative', 'Travail en équipe', 'Adaptabilité'].map((s) => (
                      <span key={s} className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-xs font-bold uppercase text-zinc-400">Langues</p>
                  <div className="flex justify-between text-zinc-700">
                    <span>Français</span>
                    <span className="text-zinc-500">Natif</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Anglais</span>
                    <span className="text-zinc-500">Avancé (C1)</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Italien</span>
                    <span className="text-zinc-500">Débutant (A2)</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-12 sm:col-span-8 space-y-6">
                <div>
                  <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">Profil</h5>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                    Designer UI &amp; développeur front-end, je conçois des interfaces sur Figma et je les développe moi-même avec React, Next.js et Three.js — du wireframe à la mise en production. J'aime particulièrement les expériences web immersives et interactives (3D, animations, micro-interactions), et j'accorde autant d'importance à l'esthétique qu'à la robustesse technique. Autonome, curieux et à l'aise en environnement agile, je recherche aujourd'hui un poste de UI Designer pour mettre cette double compétence design/développement au service de projets ambitieux.
                  </p>
                </div>

                <div className="space-y-4">
                  <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Expériences Professionnelles
                  </h5>

                  <div className="space-y-1.5 border-l-2 border-zinc-200 pl-4">
                    <div className="flex items-center justify-between">
                      <h6 className="font-display font-bold text-sm text-zinc-950">UI Designer — L’Atelier Berger</h6>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                        2026 — Présent
                      </span>
                    </div>
                    <p className="font-mono text-xs text-zinc-500">Freelance</p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-600 text-xs">
                      <li>Conception et développement d'une expérience web 3D interactive pour la refonte du site vitrine.</li>
                      <li>Globe 3D interactif avec navigation dynamique et animations fluides (React, Three.js).</li>
                      <li>Maquettes UI/UX sur Figma, intégration pixel-perfect en React.</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5 border-l-2 border-zinc-200 pl-4">
                    <div className="flex items-center justify-between">
                      <h6 className="font-display font-bold text-sm text-zinc-950">UI Designer — Ping Paris</h6>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                        2026
                      </span>
                    </div>
                    <p className="font-mono text-xs text-zinc-500">Freelance</p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-600 text-xs">
                      <li>Application web de géolocalisation des tables de ping-pong à Paris.</li>
                      <li>UX/UI complète : wireframes, prototypes haute-fidélité sur Figma.</li>
                      <li>Développement responsive et performant avec Next.js et Tailwind CSS.</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5 border-l-2 border-zinc-200 pl-4">
                    <div className="flex items-center justify-between">
                      <h6 className="font-display font-bold text-sm text-zinc-950">UI Designer &amp; Graphiste — Centre de Neuro-Pédagogie de Strasbourg</h6>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                        2025
                      </span>
                    </div>
                    <p className="font-mono text-xs text-zinc-500">Mission</p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-600 text-xs">
                      <li>Refonte et modernisation du site vitrine (HTML5, CSS3, JavaScript, Framer).</li>
                      <li>Optimisation SEO on-page, déploiement et configuration DNS.</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5 border-l-2 border-zinc-200 pl-4">
                    <div className="flex items-center justify-between">
                      <h6 className="font-display font-bold text-sm text-zinc-950">Web Designer — Le Comité du Souvenir Français</h6>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                        2025
                      </span>
                    </div>
                    <p className="font-mono text-xs text-zinc-500">Freelance</p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-600 text-xs">
                      <li>Prototypes haute-fidélité sur Figma et Framer.</li>
                      <li>Mise en ligne avec stratégie DNS et déploiement.</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Formations
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-zinc-200 p-3">
                      <div className="flex justify-between font-bold text-zinc-950">
                        <span>Product Designer</span>
                        <span className="font-mono text-xs text-zinc-500">2026</span>
                      </div>
                      <p className="text-zinc-500 text-xs mt-0.5">OpenClassrooms</p>
                      <p className="text-zinc-400 text-[11px]">RNCP Niv. 6 (Bac+3/4) — En cours</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 p-3">
                      <div className="flex justify-between font-bold text-zinc-950">
                        <span>BUT Info-Com</span>
                        <span className="font-mono text-xs text-zinc-500">2025</span>
                      </div>
                      <p className="text-zinc-500 text-xs mt-0.5">IUT Haguenau / Univ. Strasbourg</p>
                      <p className="text-zinc-400 text-[11px]">Stratégie de Communication Digitale</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 p-3">
                      <div className="flex justify-between font-bold text-zinc-950">
                        <span>Production Sonore</span>
                        <span className="font-mono text-xs text-zinc-500">2017</span>
                      </div>
                      <p className="text-zinc-500 text-xs mt-0.5">Recording Arts of Canada — Montréal</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 p-3">
                      <div className="flex justify-between font-bold text-zinc-950">
                        <span>Baccalauréat STD2A</span>
                        <span className="font-mono text-xs text-zinc-500">2015</span>
                      </div>
                      <p className="text-zinc-500 text-xs mt-0.5">Paris 6e — Design &amp; Arts Appliqués</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};
