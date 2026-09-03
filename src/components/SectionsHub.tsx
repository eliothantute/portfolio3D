import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Language, SkillType } from '../types';
import { InteractiveText } from './InteractiveText';
import { ServicesSection } from './ServicesSection';
import { VelocityCarousel } from './VelocityCarousel';
import { SkillsVelocityCarousel } from './SkillsVelocityCarousel';
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
    services: false,
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

  // Automatically open target section and scroll to it when CTA or anchor link is clicked
  useEffect(() => {
    const handleNavigation = (sectionKey: string) => {
      if (['services', 'skills', 'projects', 'cv', 'contact'].includes(sectionKey)) {
        setOpenSections((prev) => ({
          ...prev,
          [sectionKey]: true,
        }));
        setTimeout(() => {
          const el = document.getElementById(sectionKey);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
      }
    };

    // Check on initial page load
    if (window.location.hash) {
      handleNavigation(window.location.hash.replace('#', ''));
    }

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
      if (['services', 'skills', 'projects', 'cv', 'contact'].includes(sectionKey)) {
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

  const handleSelectSkill = (skillType: SkillType) => {
    setSelectedSkillFilter(skillType);
    setOpenSections((prev) => ({
      ...prev,
      projects: true,
    }));
    // Scroll to projects section smoothly
    setTimeout(() => {
      const el = document.getElementById('projects');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Filtered projects according to active skill type
  const filteredProjects = projects.filter((p) => {
    if (selectedSkillFilter === 'all') return true;
    return p.skillType === selectedSkillFilter;
  });

  const sectionHeaders = [
    {
      key: 'services',
      id: 'services',
      num: '01',
      title: lang === 'fr' ? 'Services & Expertises' : 'Services & Solutions',
      desc:
        lang === 'fr'
          ? 'Site vitrine, landing page, e-commerce, apps, 3D & logos'
          : 'Showcase sites, landing pages, e-commerce, apps, 3D & brand logos',
    },
    {
      key: 'skills',
      id: 'skills',
      num: '02',
      title: lang === 'fr' ? 'Compétences & Stack' : 'Skills & Stack',
      desc:
        lang === 'fr'
          ? 'Front-End, Design UI/UX et Applications & IA en carrousel 3D'
          : 'Front-End, UI/UX Design and Applications & AI in 3D carousel',
    },
    {
      key: 'projects',
      id: 'projects',
      num: '03',
      title: lang === 'fr' ? 'Projets & Réalisations' : 'Selected Projects',
      desc:
        lang === 'fr'
          ? `Filtré par : ${selectedSkillFilter.toUpperCase()} (${filteredProjects.length} projets)`
          : `Filtered by: ${selectedSkillFilter.toUpperCase()} (${filteredProjects.length} projects)`,
    },
    {
      key: 'cv',
      id: 'cv',
      num: '04',
      title: lang === 'fr' ? 'Curriculum Vitae 3D' : 'Curriculum Vitae 3D',
      desc:
        lang === 'fr'
          ? 'Carte 3D interactive, téléchargement PDF & visualiseur 360°'
          : '3D Gyroscopic card, PDF download & 360° standalone viewer',
    },
    {
      key: 'contact',
      id: 'contact',
      num: '05',
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
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 font-mono text-lg shadow-sm transition-all group-hover:scale-105 group-hover:bg-zinc-950 group-hover:text-white cursor-pointer"
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
                    {/* SECTION 01: SERVICES & SOLUTIONS */}
                    {sec.key === 'services' && (
                      <ServicesSection
                        lang={lang}
                        onHoverItem={onHoverItem}
                        onLeaveItem={onLeaveItem}
                      />
                    )}

                    {/* SECTION 02: 3D SKILLS VELOCITY CAROUSEL */}
                    {sec.key === 'skills' && (
                      <div className="flex flex-col pb-6">
                        <SkillsVelocityCarousel
                          lang={lang}
                          onSelectSkill={handleSelectSkill}
                          onHoverItem={onHoverItem}
                          onLeaveItem={onLeaveItem}
                        />
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

                          <button
                            type="button"
                            onClick={() => setSelectedSkillFilter('music')}
                            className={`rounded-full px-5 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                              selectedSkillFilter === 'music'
                                ? 'bg-purple-600 text-white shadow-md scale-105'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {lang === 'fr' ? 'COMPOSITION MUSICALE' : 'MUSIC COMPOSITION'} (
                            {projects.filter((p) => p.skillType === 'music').length})
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
