import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { profileData, stackCategoriesData } from '../data/projects';
import { Language } from '../types';
import { InteractiveText } from './InteractiveText';

interface AboutSectionProps {
  lang: Language;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const fadeUp3DVariants: Variants = {
  hidden: { opacity: 0, y: 35, rotateX: 10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const pillar3DVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: 14, scale: 0.94 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: idx * 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const AboutSection: React.FC<AboutSectionProps> = ({ lang, onHoverItem, onLeaveItem }) => {
  const profile = profileData[lang];
  const stackCategories = stackCategoriesData[lang];
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  return (
    <section
      id="about"
      className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-8 lg:px-12 [perspective:1200px]"
      aria-label={lang === 'fr' ? 'À propos et compétences' : 'About and capabilities'}
    >
      {/* Studio Header with 3D Entrance */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="max-w-4xl space-y-5"
      >
        <motion.span
          variants={fadeUp3DVariants}
          className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
          Studio Profile &amp; Positioning
        </motion.span>

        <motion.h2
          variants={fadeUp3DVariants}
          className="font-display text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl"
        >
          <InteractiveText
            text={profile.aboutTitle}
            hoverColor="#0066ff"
          />
        </motion.h2>

        <motion.div
          variants={fadeUp3DVariants}
          className="grid gap-6 text-base leading-relaxed text-zinc-600 sm:grid-cols-2 sm:text-lg"
        >
          <p>{profile.aboutParagraph1}</p>
          <p className="text-zinc-500">{profile.aboutParagraph2}</p>
        </motion.div>
      </motion.div>

      {/* 3 Core Value Pillars with 3D Perspective */}
      <div className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            {lang === 'fr' ? '3 Piliers du Profil' : '3 Core Pillars'}
          </h3>
          <span className="font-mono text-xs text-zinc-400">
            {lang === 'fr' ? 'Positionnement Clé' : 'Key Positioning'}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3 [perspective:1000px]">
          {profile.pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.id}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={pillar3DVariants}
              onMouseEnter={() => onHoverItem?.(pillar.title.toUpperCase())}
              onMouseLeave={onLeaveItem}
              className="sneaks-card group flex flex-col justify-between rounded-3xl p-7 [transform-style:preserve-3d]"
            >
              <div>
                <span className="mb-4 inline-block rounded-full bg-zinc-100 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  {pillar.subtitle}
                </span>
                <h4 className="font-display text-xl font-bold tracking-tight text-zinc-950 transition-colors group-hover:text-blue-600 sm:text-2xl">
                  {pillar.title}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 border-t border-zinc-100 pt-4">
                <span className="font-mono text-xs font-semibold text-zinc-500">
                  {pillar.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stack & Capabilities Grid - 4 Full Width Clusters */}
      <div className="mt-20 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              {lang === 'fr' ? 'Organisation de la Stack' : 'Stack Organization'}
            </span>
            <h3 className="font-display mt-1 text-2xl font-bold text-zinc-950 sm:text-3xl">
              {lang === 'fr' ? 'Outils & Technologies' : 'Tools & Technologies'}
            </h3>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-xs font-medium text-zinc-600">
            4 Clusters
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [perspective:1000px]">
          {stackCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              onMouseEnter={() => {
                setActiveCategoryIndex(idx);
                onHoverItem?.(cat.name.toUpperCase());
              }}
              onMouseLeave={() => {
                setActiveCategoryIndex(null);
                onLeaveItem?.();
              }}
              className={`sneaks-card flex flex-col justify-between rounded-2xl p-5 ${
                activeCategoryIndex === idx
                  ? 'border-zinc-900 shadow-md'
                  : ''
              }`}
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {cat.tag}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-400">0{idx + 1}</span>
                </div>
                <h4 className="font-display text-lg font-bold text-zinc-950">
                  {cat.name}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-3">
                {cat.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="rounded-lg bg-zinc-100 px-2 py-1 font-mono text-[10px] font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
