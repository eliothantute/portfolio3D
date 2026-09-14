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
        className="relative mx-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-2xl transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre supérieure : Badge & Bouton Fermer */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5 mb-4">
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

        {/* Prévisualisation Image : Sans Crop, 100% lisible et centrée */}
        <div className="relative w-full max-h-[320px] sm:max-h-[380px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-center mb-5">
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
              className="w-full h-auto max-h-[320px] sm:max-h-[380px] object-contain object-center"
            />
          )}
        </div>

        {/* Titre & Description du projet */}
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              {project.title}
            </h2>
            {project.subtitle && (
              <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {project.subtitle}
              </p>
            )}
          </div>

          <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
            {project.description}
          </p>

          {/* Grille de métadonnées lisible */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <div>
              <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider mb-0.5">
                {lang === 'fr' ? 'Rôle' : 'Role'}
              </span>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                {Array.isArray(project.role) ? project.role.join(' • ') : (project.role || 'Développeur & Designer')}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider mb-0.5">
                {lang === 'fr' ? 'Année' : 'Year'}
              </span>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{project.year}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider mb-0.5">
                Stack
              </span>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                {project.stack.slice(0, 3).join(', ')}
              </span>
            </div>
          </div>

          {/* Tags Stack Complets */}
          {project.stack && project.stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Boutons d'action : Voir en direct & GitHub */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => onHoverItem?.('VISITER')}
                  onMouseLeave={onLeaveItem}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
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
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 cursor-pointer"
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
