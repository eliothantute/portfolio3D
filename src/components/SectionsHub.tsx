import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Language, SkillType } from '../types';
import { InteractiveText } from './InteractiveText';
import { LollipopCarousel } from './LollipopCarousel';
import { CollaborationModes } from './CollaborationModes';
import { Resume3D } from './Resume3D';

interface SectionsHubProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onOpenContact?: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const SectionsHub: React.FC<SectionsHubProps> = ({
  projects,
  lang,
  onSelectProject,
  onOpenContact,
  onHoverItem,
  onLeaveItem,
}) => {
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<SkillType>('all');
  // Sections closed by default on initial page load, and open on click
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    modes: false,
    projects: false,
    cv: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Automatically open target section and scroll to it when CTA or navbar link is clicked
  useEffect(() => {
    const handleNavigation = (sectionKey: string) => {
      const normalizedKey =
        sectionKey === 'modes' || sectionKey === 'collaboration' || sectionKey === 'collab' || sectionKey === 'services'
          ? 'modes'
          : sectionKey === 'projects' || sectionKey === 'projet' || sectionKey === 'projets'
          ? 'projects'
          : sectionKey === 'cv'
          ? 'cv'
          : sectionKey;

      if (['modes', 'projects', 'cv'].includes(normalizedKey)) {
        setOpenSections((prev) => ({
          ...prev,
          [normalizedKey]: true,
        }));
        setTimeout(() => {
          const el = document.getElementById(normalizedKey);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } else if (normalizedKey === 'contact') {
        const el = document.getElementById('contact');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    const handleHashChange = () => {
      if (window.location.hash) {
        handleNavigation(window.location.hash.replace('#', ''));
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;
      const sectionKey = href.replace('#', '');
      if (['modes', 'collaboration', 'collab', 'services', 'projects', 'projet', 'projets', 'cv', 'contact'].includes(sectionKey)) {
        handleNavigation(sectionKey);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Filtered projects according to active skill type
  const filteredProjects = projects.filter((p) => {
    if (selectedSkillFilter === 'all') return true;
    return p.skillType === selectedSkillFilter;
  });

  const sectionHeaders = [
    {
      key: 'modes',
      id: 'modes',
      num: '01',
      badge: lang === 'fr' ? 'MODES D’INTERVENTION & PRESTATIONS' : 'COLLABORATION MODES & SERVICES',
      title: lang === 'fr' ? 'Modes : Design au déploiement, refonte, animation, musique' : 'Modes: Design to deploy, redesign, animation, music',
    },
    {
      key: 'projects',
      id: 'projects',
      num: '02',
      badge: lang === 'fr' ? 'SÉLECTION DE TRAVAUX' : 'SELECTED WORKS',
      title: lang === 'fr' ? 'Projets & Réalisations' : 'Selected Projects',
    },
    {
      key: 'cv',
      id: 'cv',
      num: '03',
      badge: lang === 'fr' ? 'CURRICULUM VITAE OFFICIEL' : 'OFFICIAL RESUME',
      title: lang === 'fr' ? 'Curriculum Vitae 2026' : 'Curriculum Vitae 2026',
    },
  ];

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-12">
      {/* Sections Accordion List */}
      <div className="flex flex-col divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
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
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {sec.num} //
                    </span>
                    <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {sec.badge}
                    </span>
                  </div>
                  <h2 className="font-urbanist text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 group-hover:text-zinc-800 transition-colors dark:text-white dark:group-hover:text-zinc-200">
                    <InteractiveText text={sec.title} hoverColor="#52525b" />
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 font-mono text-lg shadow-sm transition-all group-hover:scale-105 group-hover:bg-zinc-950 group-hover:text-white cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
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
                    {/* SECTION 01: MODES D'INTERVENTION */}
                    {sec.key === 'modes' && (
                      <div className="flex flex-col pb-6">
                        <CollaborationModes
                          lang={lang}
                          onOpenContact={onOpenContact}
                          onHoverItem={onHoverItem}
                          onLeaveItem={onLeaveItem}
                          hideHeader={true}
                        />
                      </div>
                    )}

                    {/* SECTION 02: PROJETS & RÉALISATIONS */}
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
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200'
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
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200'
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
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200'
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
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200'
                            }`}
                          >
                            APP ({projects.filter((p) => p.skillType === 'app').length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedSkillFilter('music')}
                            className={`rounded-full px-5 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                              selectedSkillFilter === 'music'
                                ? 'bg-purple-600 text-white shadow-md scale-105'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200'
                            }`}
                          >
                            {lang === 'fr' ? 'COMPOSITION MUSICALE' : 'MUSIC COMPOSITION'} (
                            {projects.filter((p) => p.skillType === 'music').length})
                          </button>
                        </div>

                        {/* Lollipop Carousel */}
                        <LollipopCarousel
                          projects={filteredProjects}
                          lang={lang}
                          onSelectProject={onSelectProject}
                          onHoverItem={onHoverItem}
                          onLeaveItem={onLeaveItem}
                        />
                      </div>
                    )}

                    {/* SECTION 03: CV 2026 */}
                    {sec.key === 'cv' && (
                      <div className="pb-6">
                        <Resume3D
                          lang={lang}
                          onHoverItem={onHoverItem}
                          onLeaveItem={onLeaveItem}
                          hideHeader={true}
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
