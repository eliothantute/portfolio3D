import React, { useRef, useState } from 'react';
import { projectsData } from './data/projects';
import { Project, Language } from './types';
import { CustomCursor } from './components/CustomCursor';
import { Background3D } from './components/Background3D';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CinematicVideoSection } from './components/CinematicVideoSection';
import { ProjectCards } from './components/ProjectCards';
import { AtelierGlobeSection } from './components/AtelierGlobeSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { AudioPlayer } from './components/AudioPlayer';
import { ProjectModal } from './components/ProjectModal';

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [cursorText, setCursorText] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const currentProjects = projectsData[lang];
  const atelierProject = currentProjects.find((p) => p.id === 'atelier-berger')!;

  const handleHoverItem = (text: string) => {
    setCursorText(text);
    setIsHovered(true);
  };

  const handleLeaveItem = () => {
    setCursorText('');
    setIsHovered(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      <div className="site-aurora site-aurora-primary" />
      <div className="site-aurora site-aurora-secondary" />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(255,255,255,0.32)_0%,transparent_14%,transparent_86%,rgba(255,255,255,0.24)_100%)]" />

      {/* Curseur Magnétique Custom */}
      <CustomCursor cursorText={cursorText} isHovered={isHovered} />

      {/* Arrière-Plan Three.js Cinématique */}
      <Background3D analyserRef={analyserRef} />

      <section className="sr-only" aria-label={lang === 'fr' ? 'Résumé des projets principaux' : 'Primary projects summary'}>
        <h1>{lang === 'fr' ? 'Portfolio UI et développement front-end de Eliot Hantute' : 'UI design and front-end portfolio by Eliot Hantute'}</h1>
        <ul>
          {currentProjects.slice(0, 6).map((project) => (
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
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        <Hero
          lang={lang}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        <AtelierGlobeSection
          project={atelierProject}
          lang={lang}
          onSelectProject={(project) => setSelectedProject(project)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        <ProjectCards
          projects={currentProjects}
          lang={lang}
          onSelectProject={(project) => setSelectedProject(project)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

        <AboutSection
          lang={lang}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />

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

        <CinematicVideoSection lang={lang} />

        <ProjectModal
          project={selectedProject}
          lang={lang}
          onClose={() => setSelectedProject(null)}
          onHoverItem={handleHoverItem}
          onLeaveItem={handleLeaveItem}
        />
      </div>
    </div>
  );
}

