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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl md:rounded-3xl border border-black/[0.1] bg-white p-6 sm:p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between border-b border-black/[0.08] pb-4 mb-6">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            <span className="font-bold text-black">[ EH® ‒ {project.year} ]</span>
            <span>/</span>
            <span>{project.category}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => onHoverItem?.('FERMER')}
            onMouseLeave={onLeaveItem}
            className="rounded-full border border-black/[0.12] bg-zinc-50 px-3.5 py-1 font-mono text-xs font-semibold text-black transition-all hover:bg-black hover:text-white cursor-pointer"
          >
            ✕ {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

        {/* Media Preview */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-100 mb-6">
          {project.youtubeId ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${project.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Title & Simple Description */}
        <div className="space-y-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-black">
            {project.title}
          </h2>

          <p className="text-base text-zinc-600 leading-relaxed font-normal">
            {project.description}
          </p>

          {/* Metadata Grid in Neiden Style */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-black/[0.08] pt-4 font-mono text-xs text-zinc-600">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase">Rôle</span>
              <span className="text-black font-semibold">{Array.isArray(project.role) ? project.role.join(' • ') : (project.role || 'Développeur & Designer')}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase">Année</span>
              <span className="text-black font-semibold">{project.year}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase">Technologies</span>
              <span className="text-black font-semibold">{project.stack.slice(0, 3).join(', ')}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.08] pt-6">
            <div className="flex items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => onHoverItem?.('VISITER')}
                  onMouseLeave={onLeaveItem}
                  className="neiden-btn-primary"
                >
                  <span>{lang === 'fr' ? 'Voir le projet en direct ↗' : 'Visit live site ↗'}</span>
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => onHoverItem?.('GITHUB')}
                  onMouseLeave={onLeaveItem}
                  className="neiden-btn-secondary"
                >
                  <span>GitHub ↗</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-500 hover:text-black transition-colors cursor-pointer"
            >
              ← {lang === 'fr' ? 'Retour aux projets' : 'Back to work'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
