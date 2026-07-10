import React, { useEffect } from 'react';
import { Project, Language } from '../types';

interface ProjectModalProps {
  project: Project | null;
  lang: Language;
  onClose: () => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  lang,
  onClose,
  onHoverItem,
  onLeaveItem,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto px-4 py-8 sm:p-10 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Container Modale */}
      <div
        className="relative w-full max-w-5xl rounded-3xl border border-[#ff571a]/40 bg-[#111111] overflow-hidden shadow-[0_0_100px_rgba(255,87,26,0.3)] my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topbar close */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#111111]/90 backdrop-blur-md px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3 font-mono text-xs text-[#ff571a] tracking-widest uppercase">
            <span>● CASE STUDY</span>
            <span className="text-white/30">//</span>
            <span className="text-white">{project.id.toUpperCase()}</span>
          </div>

          <button
            onClick={onClose}
            onMouseEnter={() => onHoverItem?.('CLOSE')}
            onMouseLeave={onLeaveItem}
            className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-[#ff571a] hover:text-black flex items-center justify-center transition-all font-mono font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Corps du Case Study scrolable */}
        <div className="overflow-y-auto p-6 sm:p-12 space-y-12 flex-grow">
          {/* Header Projet */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#ff571a] font-bold block">
              {project.category} // {project.year}
            </span>

            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none">
              {project.title}
            </h1>

            <p className="text-xl font-light text-white/80 leading-relaxed max-w-3xl">
              {project.subtitle}
            </p>
          </div>

          {/* Image immersive */}
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black relative">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Grid Objectifs & Rôles */}
          <div className="grid md:grid-cols-3 gap-8 pt-6 border-t border-white/10 font-mono text-xs">
            <div className="space-y-2">
              <span className="text-[#ff571a] tracking-widest block font-bold">
                {lang === 'fr' ? '// OBJECTIF' : '// OBJECTIVE'}
              </span>
              <p className="text-white/80 font-sans text-sm leading-relaxed">
                {project.objective}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[#ff571a] tracking-widest block font-bold">
                {lang === 'fr' ? '// RÔLES' : '// ROLE'}
              </span>
              <div className="flex flex-col gap-1 text-white/80">
                {project.role.map((r, idx) => (
                  <span key={idx}>✦ {r}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[#ff571a] tracking-widest block font-bold">
                {lang === 'fr' ? '// TECHNOLOGIES' : '// STACK'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-white/5 border border-white/10 px-2 py-1 rounded text-white/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Longue description détaillée */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-white">
              {lang === 'fr' ? 'VISION & EXÉCUTION' : 'VISION & CRAFT'}
            </h3>
            <p className="text-white/80 font-light text-base sm:text-lg leading-relaxed max-w-4xl">
              {project.longDescription}
            </p>
          </div>

          {/* Metrics ou Highlights */}
          {project.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#ff571a]/10 border border-[#ff571a]/30">
              {project.metrics.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="font-mono text-2xl sm:text-4xl font-black text-white block">
                    {m.value}
                  </span>
                  <span className="font-mono text-xs text-[#ff571a] uppercase tracking-wider block">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-white/10 bg-[#141414] p-6 sm:px-10 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="font-mono text-xs uppercase text-white/60 hover:text-white transition-colors tracking-widest"
          >
            ← {lang === 'fr' ? 'RETOUR AU PORTFOLIO' : 'BACK TO PORTFOLIO'}
          </button>

          <div className="flex gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => onHoverItem?.('CODE')}
                onMouseLeave={onLeaveItem}
                className="border border-white/20 hover:border-white text-white px-6 py-3 rounded-full font-mono text-xs uppercase tracking-widest transition-all"
              >
                GitHub ↗
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => onHoverItem?.('LIVE')}
                onMouseLeave={onLeaveItem}
                className="bg-[#ff571a] text-black hover:bg-white px-8 py-3 rounded-full font-mono text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,87,26,0.6)]"
              >
                {lang === 'fr' ? 'VOIR LE SITE ↗' : 'LAUNCH LIVE ↗'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
