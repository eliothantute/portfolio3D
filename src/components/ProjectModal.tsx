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
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative mx-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre supérieure : Badge & Bouton Fermer */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">[ {project.year} ]</span>
            <span>/</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
              {project.category}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => onHoverItem?.('FERMER')}
            onMouseLeave={onLeaveItem}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 cursor-pointer"
          >
            <span>✕</span>
            <span>{lang === 'fr' ? 'Fermer' : 'Close'}</span>
          </button>
        </div>

        {/* Prévisualisation Image : Sans Crop, 100% lisible */}
        <div className="relative w-full max-h-[340px] sm:max-h-[380px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-center mb-5">
          {project.youtubeId ? (
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${project.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-auto max-h-[340px] sm:max-h-[380px] object-contain object-center"
            />
          )}
        </div>

        {/* Titre & Explication claire et simple (sans blabla ni spécifications dans tous les sens) */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {project.title}
          </h2>

          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
            {project.longDescription || project.description}
          </p>

          {/* Boutons d'action : Accès direct à l'URL du projet & GitHub */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-5 mt-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => onHoverItem?.('VISITER')}
                  onMouseLeave={onLeaveItem}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
                >
                  <span>{lang === 'fr' ? 'Accéder au projet en direct ↗' : 'Visit live project ↗'}</span>
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => onHoverItem?.('GITHUB')}
                  onMouseLeave={onLeaveItem}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>GitHub ↗</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer py-1"
            >
              ← {lang === 'fr' ? 'Retour aux projets' : 'Back to work'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
