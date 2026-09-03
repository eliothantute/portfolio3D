import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projectsData } from './data/projects';
import { Project, Language } from './types';
import { CustomCursor } from './components/CustomCursor';
import { Background3D } from './components/Background3D';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SectionsHub } from './components/SectionsHub';
import { AudioPlayer } from './components/AudioPlayer';
import { ProjectModal } from './components/ProjectModal';
import { ContactModal } from './components/ContactModal';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [cursorText, setCursorText] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const analyserRef = useRef<AnalyserNode | null>(null);

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-950 selection:bg-zinc-950 selection:text-white">
      {/* Curseur Magnétique Custom */}
      <CustomCursor cursorText={cursorText} isHovered={isHovered} />

      {/* Arrière-Plan Three.js Cinématique */}
      <Background3D
        analyserRef={analyserRef}
        isIntroActive={false}
      />

      <section className="sr-only" aria-label={lang === 'fr' ? 'Résumé du profil et des projets' : 'Profile and projects summary'}>
        <h1>{lang === 'fr' ? 'Eliot — Creative Front-End Developer & UI Designer | React, Three.js & AI-Augmented Development' : 'Eliot — Creative Front-End Developer & UI Designer | React, Three.js & AI-Augmented Development'}</h1>
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
          isMuted={isMuted}
          toggleAudio={() => setIsMuted(!isMuted)}
          onOpenContact={() => setIsContactOpen(true)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        {/* Hero Section */}
        <Hero
          lang={lang}
          onOpenContact={() => setIsContactOpen(true)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        {/* Sections Hub: Accordion / Sliding Section Titles with Direct Skills and Filtered Projects */}
        <SectionsHub
          projects={currentProjects}
          lang={lang}
          onSelectProject={(project) => setSelectedProject(project)}
          onOpenContact={() => setIsContactOpen(true)}
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
      </div>
    </div>
  );
}
