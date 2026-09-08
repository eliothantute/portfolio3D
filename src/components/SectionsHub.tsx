import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Language } from '../types';
import { InteractiveText } from './InteractiveText';
import { ProjectsSection } from './ProjectsSection';
import { ServicesSection } from './ServicesSection';
import { AboutSection } from './AboutSection';
import { Resume3D } from './Resume3D';
import { ContactSection } from './ContactSection';

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
  // State for which menu section is currently open (opens on click)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    projects: true, // Projets open by default for immediate showcase
    services: false,
    skills: false,
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
      const normalizedKey = sectionKey === 'about' ? 'skills' : sectionKey;
      if (['projects', 'services', 'skills', 'cv', 'contact'].includes(normalizedKey)) {
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
      }
    };

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
      if (['projects', 'services', 'skills', 'cv', 'contact', 'about'].includes(sectionKey)) {
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

  const sectionMenuItems = [
    {
      key: 'projects',
      id: 'projects',
      num: '01',
      title: lang === 'fr' ? 'Projets & Réalisations' : 'Selected Projects',
      tag: lang === 'fr' ? '[ 8 RÉALISATIONS ‒ WEBGL & REACT ]' : '[ 8 PROJECTS ‒ WEBGL & REACT ]',
      desc: lang === 'fr' ? 'Cartes fluides, filtres & démos live' : 'Fluid cards, category filters & live demos',
    },
    {
      key: 'services',
      id: 'services',
      num: '02',
      title: lang === 'fr' ? 'Services & Expertises' : 'Services & Solutions',
      tag: lang === 'fr' ? '[ SUR-MESURE & CONVERSION ]' : '[ BESPOKE & CONVERSION ]',
      desc: lang === 'fr' ? 'Vitrines, landing pages, 3D & applications' : 'Showcase, landing pages, 3D & apps',
    },
    {
      key: 'skills',
      id: 'skills',
      num: '03',
      title: lang === 'fr' ? 'Compétences & Stack' : 'Skills & Stack',
      tag: lang === 'fr' ? '[ 4 PILIERS TECHNIQUES ]' : '[ 4 CORE PILLARS ]',
      desc: lang === 'fr' ? 'Front-End, Web 3D, Design UI & IA' : 'Front-End, Web 3D, UI Design & AI',
    },
    {
      key: 'cv',
      id: 'cv',
      num: '04',
      title: lang === 'fr' ? 'Curriculum Vitae 2026' : 'Curriculum Vitae 2026',
      tag: lang === 'fr' ? '[ DOCUMENT & MODE 3D ]' : '[ DOCUMENT & 3D MODE ]',
      desc: lang === 'fr' ? 'Document HD lisible, 3D tilt & téléchargement' : 'Readable HD view, 3D tilt & download',
    },
    {
      key: 'contact',
      id: 'contact',
      num: '05',
      title: lang === 'fr' ? 'Contact & Collaboration' : 'Let’s Talk',
      tag: lang === 'fr' ? '[ DISPONIBLE • PARIS & DISTANCIEL ]' : '[ AVAILABLE • PARIS & REMOTE ]',
      desc: lang === 'fr' ? 'Échangeons autour de votre prochain projet' : 'Let’s discuss your next project',
    },
  ];

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-12">
      {/* Neiden Editorial Accordion Menu */}
      <div className="flex flex-col border-t border-black/[0.08]">
        {sectionMenuItems.map((item) => {
          const isOpen = openSections[item.key];

          return (
            <div
              key={item.key}
              id={item.id}
              className="border-b border-black/[0.08] py-6 sm:py-8 transition-colors duration-300 scroll-mt-24"
            >
              {/* Menu Row Header (Click to Open / Close) */}
              <button
                type="button"
                onClick={() => toggleSection(item.key)}
                onMouseEnter={() => onHoverItem?.(item.title.toUpperCase())}
                onMouseLeave={onLeaveItem}
                className="group flex w-full items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="font-mono text-sm sm:text-base font-bold text-zinc-400 group-hover:text-black transition-colors">
                    {item.num}.
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-black group-hover:text-zinc-600 transition-colors">
                      <InteractiveText text={item.title} hoverColor="#000000" />
                    </h2>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {item.tag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden lg:block font-mono text-xs text-zinc-400">
                    {item.desc}
                  </span>

                  {/* Neiden Minimal Pill Toggle */}
                  <div className="flex items-center gap-2 rounded-full border border-black/[0.1] bg-white px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-xs font-semibold text-black transition-all group-hover:border-black group-hover:bg-black group-hover:text-white">
                    <span className="hidden sm:inline">
                      {isOpen ? (lang === 'fr' ? 'Fermer' : 'Close') : (lang === 'fr' ? 'Ouvrir' : 'Open')}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-block text-sm leading-none font-bold"
                    >
                      +
                    </motion.span>
                  </div>
                </div>
              </button>

              {/* Expandable Section Content Body */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`menu-content-${item.key}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden pt-8"
                  >
                    {/* 01: Fluid Projects Section */}
                    {item.key === 'projects' && (
                      <ProjectsSection
                        projects={projects}
                        lang={lang}
                        onSelectProject={onSelectProject}
                        onHoverItem={onHoverItem}
                        onLeaveItem={onLeaveItem}
                        hideHeader={true}
                      />
                    )}

                    {/* 02: Services Section */}
                    {item.key === 'services' && (
                      <ServicesSection
                        lang={lang}
                        onOpenContact={onOpenContact}
                        onHoverItem={onHoverItem}
                        onLeaveItem={onLeaveItem}
                        hideHeader={true}
                      />
                    )}

                    {/* 03: Skills & Capabilities */}
                    {item.key === 'skills' && (
                      <AboutSection
                        lang={lang}
                        onHoverItem={onHoverItem}
                        onLeaveItem={onLeaveItem}
                        hideHeader={true}
                      />
                    )}

                    {/* 04: CV 2026 */}
                    {item.key === 'cv' && (
                      <Resume3D
                        lang={lang}
                        onHoverItem={onHoverItem}
                        onLeaveItem={onLeaveItem}
                        hideHeader={true}
                      />
                    )}

                    {/* 05: Contact */}
                    {item.key === 'contact' && (
                      <ContactSection
                        lang={lang}
                        onHoverItem={onHoverItem}
                        onLeaveItem={onLeaveItem}
                        hideHeader={true}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
