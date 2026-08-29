import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Language, SkillType } from '../types';
import { skillsCategories } from '../data/projects';
import { InteractiveText } from './InteractiveText';
import { VelocityCarousel } from './VelocityCarousel';
import { Resume3D } from './Resume3D';
import { ContactSection } from './ContactSection';

interface SectionsHubProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const SectionsHub: React.FC<SectionsHubProps> = ({
  projects,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<SkillType>('all');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    skills: false,
    projects: false,
    cv: false,
    contact: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Filtered projects according to active skill type
  const filteredProjects = projects.filter((p) => {
    if (selectedSkillFilter === 'all') return true;
    return p.skillType === selectedSkillFilter;
  });

  const sectionHeaders = [
    {
      key: 'skills',
      id: 'skills',
      num: '01',
      title: lang === 'fr' ? 'Compétences & Stack' : 'Skills & Stack',
      desc:
        lang === 'fr'
          ? 'Front-End, Design UI/UX et Applications & IA présentés directement'
          : 'Front-End, UI/UX Design and Applications & AI presented directly',
    },
    {
      key: 'projects',
      id: 'projects',
      num: '02',
      title: lang === 'fr' ? 'Projets & Réalisations' : 'Selected Projects',
      desc:
        lang === 'fr'
          ? `Filtré par : ${selectedSkillFilter.toUpperCase()} (${filteredProjects.length} projets)`
          : `Filtered by: ${selectedSkillFilter.toUpperCase()} (${filteredProjects.length} projects)`,
    },
    {
      key: 'cv',
      id: 'cv',
      num: '03',
      title: lang === 'fr' ? 'Curriculum Vitae 3D' : 'Curriculum Vitae 3D',
      desc:
        lang === 'fr'
          ? 'Carte 3D interactive, téléchargement PDF & visualiseur 360°'
          : '3D Gyroscopic card, PDF download & 360° standalone viewer',
    },
    {
      key: 'contact',
      id: 'contact',
      num: '04',
      title: lang === 'fr' ? 'Contact & Collaboration' : 'Contact & Inquiries',
      desc:
        lang === 'fr'
          ? 'Disponible pour opportunités CDI & missions freelance'
          : 'Available for full-time roles & freelance projects',
    },
  ];

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:px-12">
      {/* Sections Accordion List */}
      <div className="flex flex-col divide-y divide-zinc-200 border-y border-zinc-200">
        {sectionHeaders.map((sec) => {
          const isOpen = openSections[sec.key];

          return (
            <section
              key={sec.key}
              id={sec.id}
              className="py-6 sm:py-8 transition-colors duration-300 scroll-mt-24"
            >
              {/* Section Header Title Row (Clickable to open/close) */}
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                onMouseEnter={() => onHoverItem?.(sec.title.toUpperCase())}
                onMouseLeave={onLeaveItem}
                className="group flex w-full items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="font-mono text-sm sm:text-base font-bold text-zinc-400 group-hover:text-zinc-950 transition-colors">
                    {sec.num} //
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 group-hover:text-blue-600 transition-colors">
                    <InteractiveText text={sec.title} hoverColor="#0066ff" />
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden md:block font-mono text-xs text-zinc-400">
                    {sec.desc}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 font-mono text-lg shadow-sm transition-all group-hover:scale-105 group-hover:bg-zinc-950 group-hover:text-white"
                  >
                    +
                  </motion.span>
                </div>
              </button>

              {/* Section Expandable Body */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`content-${sec.key}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden pt-8"
                  >
                    {/* SECTION 01: DIRECT SKILLS PRESENTATION */}
                    {sec.key === 'skills' && (
                      <div className="flex flex-col gap-8 pb-6">
                        <div className="grid gap-6 md:grid-cols-3">
                          {skillsCategories.map((cat) => {
                            const isSelected = selectedSkillFilter === cat.type;

                            return (
                              <motion.div
                                key={cat.type}
                                whileHover={{ y: -6, scale: 1.02 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                onClick={() => {
                                  setSelectedSkillFilter(cat.type);
                                  // Open projects section if closed
                                  setOpenSections((prev) => ({ ...prev, projects: true }));
                                }}
                                className={`sneaks-card relative flex flex-col justify-between rounded-3xl p-6 cursor-pointer border transition-all duration-300 ${
                                  isSelected
                                    ? 'border-zinc-950 bg-white shadow-xl ring-2 ring-zinc-950/10'
                                    : 'border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 shadow-sm'
                                }`}
                              >
                                <div>
                                  {/* Header Badge */}
                                  <div className="flex items-center justify-between">
                                    <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                                      {cat.type === 'frontend'
                                        ? 'FRONT-END'
                                        : cat.type === 'design'
                                        ? 'DESIGN'
                                        : 'APP'}
                                    </span>
                                    <span className="font-mono text-xs font-semibold text-zinc-400">
                                      {cat.projectIds.length} {lang === 'fr' ? 'projets' : 'projects'}
                                    </span>
                                  </div>

                                  {/* Title & Description */}
                                  <h3 className="font-display mt-4 text-2xl font-bold text-zinc-950">
                                    {cat.title[lang]}
                                  </h3>
                                  <p className="mt-1 font-mono text-xs font-semibold text-blue-600">
                                    {cat.subtitle[lang]}
                                  </p>
                                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-600">
                                    {cat.description[lang]}
                                  </p>
                                </div>

                                {/* Skills Tags List */}
                                <div className="mt-6">
                                  <div className="flex flex-wrap gap-1.5 border-t border-zinc-200/80 pt-4">
                                    {cat.skills.map((skill, sIdx) => (
                                      <span
                                        key={sIdx}
                                        className="rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-800"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Action CTA: Filter projects */}
                                  <button
                                    type="button"
                                    className="mt-5 inline-flex w-full items-center justify-between rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-600"
                                  >
                                    <span>
                                      {lang === 'fr'
                                        ? `Voir les projets ${cat.type.toUpperCase()}`
                                        : `View ${cat.type.toUpperCase()} Projects`}
                                    </span>
                                    <span>→</span>
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SECTION 02: PROJECTS FILTERED BY SKILL TYPE */}
                    {sec.key === 'projects' && (
                      <div className="flex flex-col gap-6 pb-6">
                        {/* Skill Filter Buttons (Front-End : Design : App : Tous) */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSkillFilter('all')}
                            className={`rounded-full px-5 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                              selectedSkillFilter === 'all'
                                ? 'bg-zinc-950 text-white shadow-md scale-105'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {lang === 'fr' ? 'TOUS LES PROJETS' : 'ALL PROJECTS'} ({projects.length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedSkillFilter('frontend')}
                            className={`rounded-full px-5 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                              selectedSkillFilter === 'frontend'
                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            FRONT-END (
                            {projects.filter((p) => p.skillType === 'frontend').length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedSkillFilter('design')}
                            className={`rounded-full px-5 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                              selectedSkillFilter === 'design'
                                ? 'bg-zinc-950 text-white shadow-md scale-105'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            DESIGN (
                            {projects.filter((p) => p.skillType === 'design').length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedSkillFilter('app')}
                            className={`rounded-full px-5 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                              selectedSkillFilter === 'app'
                                ? 'bg-zinc-950 text-white shadow-md scale-105'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            APP ({projects.filter((p) => p.skillType === 'app').length})
                          </button>
                        </div>

                        {/* Velocity Carousel for Filtered Projects */}
                        <VelocityCarousel
                          projects={filteredProjects}
                          lang={lang}
                          onSelectProject={onSelectProject}
                          onHoverItem={onHoverItem}
                          onLeaveItem={onLeaveItem}
                        />
                      </div>
                    )}

                    {/* SECTION 03: 3D CV & RESUME */}
                    {sec.key === 'cv' && (
                      <div className="pb-6">
                        <Resume3D
                          lang={lang}
                          onHoverItem={onHoverItem}
                          onLeaveItem={onLeaveItem}
                        />
                      </div>
                    )}

                    {/* SECTION 04: CONTACT */}
                    {sec.key === 'contact' && (
                      <div className="pb-6">
                        <ContactSection
                          lang={lang}
                          onHoverItem={onHoverItem}
                          onLeaveItem={onLeaveItem}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
};
