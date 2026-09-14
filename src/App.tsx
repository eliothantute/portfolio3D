import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projectsData } from './data/projects';
import { Project, Language, Theme } from './types';
import { CustomCursor } from './components/CustomCursor';
import { Background3D } from './components/Background3D';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SectionsHub } from './components/SectionsHub';
import { ContactSection } from './components/ContactSection';
import { AudioPlayer } from './components/AudioPlayer';
import { ProjectModal } from './components/ProjectModal';
import { ContactModal } from './components/ContactModal';
import { TechInspectorHUD } from './components/TechInspectorHUD';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [cursorText, setCursorText] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const currentProjects = projectsData[lang];

  useEffect(() => {
    // Initialize Lenis Smooth Scroll with GSAP Ticker synchronization
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  const handleHoverItem = (text: string) => {
    setCursorText(text);
    setIsHovered(true);
  };

  const handleLeaveItem = () => {
    setCursorText('');
    setIsHovered(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fafafa] dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950 transition-colors duration-500">
      {/* Curseur Magnétique Custom */}
      <CustomCursor cursorText={cursorText} isHovered={isHovered} />

      {/* Arrière-Plan Three.js Cinématique */}
      <Background3D
        analyserRef={analyserRef}
        isIntroActive={false}
      />

      <section className="sr-only" aria-label={lang === 'fr' ? 'Résumé du profil et des projets' : 'Profile and projects summary'}>
        <h1>{lang === 'fr' ? 'Eliot — Creative Front-End Developer 3D | React, Three.js & WebGL' : 'Eliot — Creative Front-End Developer 3D | React, Three.js & WebGL'}</h1>
        <ul>
          {currentProjects.slice(0, 8).map((project) => (
            <li key={`seo-${project.id}`}>
              <h2>{project.title}</h2>
              <p>{project.subtitle}</p>
              {project.liveUrl && (
                <a href={project.liveUrl} aria-label={`${lang === 'fr' ? 'Voir le projet' : 'View project'} ${project.title}`}>
                  {lang === 'fr' ? 'Voir le projet' : 'View project'}
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} aria-label={`${lang === 'fr' ? 'Voir le code de' : 'View code for'} ${project.title}`}>
                  {lang === 'fr' ? 'Voir le code' : 'View code'}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Calque de Bruit Cinématique Subtil */}
      <div className="cyber-noise" />

      <div className="relative z-10">
        <Navbar
          lang={lang}
          setLang={setLang}
          theme={theme}
          toggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          isMuted={isMuted}
          toggleAudio={() => setIsMuted(!isMuted)}
          onOpenContact={() => setIsContactOpen(true)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        {/* Hero Section (Clean, modern, simple & 100% readable) */}
        <Hero
          lang={lang}
          onOpenContact={() => setIsContactOpen(true)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        {/* Interactive Sections Hub: All sections (00 Collab, 01 Skills, 02 Projects, 03 CV) closed by default */}
        <SectionsHub
          projects={currentProjects}
          lang={lang}
          onSelectProject={(project) => setSelectedProject(project)}
          onOpenContact={() => setIsContactOpen(true)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        {/* Dedicated Full Contact Section & Socials Footer */}
        <ContactSection
          lang={lang}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        <AudioPlayer
          isMuted={isMuted}
          toggleAudio={() => setIsMuted(!isMuted)}
          lang={lang}
          analyserRef={analyserRef}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        <ProjectModal
          project={selectedProject}
          lang={lang}
          onClose={() => setSelectedProject(null)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        {/* Direct Contact Modal with Instant Access */}
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          lang={lang}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        {/* Real-Time Tech & Performance Inspector HUD (FPS & Fluidity Monitor) */}
        <TechInspectorHUD lang={lang} />
      </div>
    </div>
  );
}
