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

  const primaryServices = project.role.slice(0, 4);
  const projectActionLabel = lang === 'fr' ? 'Lancer le projet' : 'Launch project';

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-[#020b1f]/94 px-4 py-6 backdrop-blur-xl sm:px-8 sm:py-8"
      onClick={onClose}
    >
      <div
        className="relative mx-auto w-full max-w-[1380px] overflow-hidden rounded-[2.15rem] border border-white/10 bg-[linear-gradient(160deg,#020c23_0%,#010915_52%,#061332_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(255,115,58,0.12),transparent_36%),radial-gradient(circle_at_70%_65%,rgba(95,130,255,0.14),transparent_42%)]" />

        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-6">
          <button
            onClick={onClose}
            onMouseEnter={() => onHoverItem?.('BACK')}
            onMouseLeave={onLeaveItem}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#10131a] transition-all hover:scale-[1.02] hover:bg-slate-200"
          >
            <span>←</span>
            <span>{lang === 'fr' ? 'Retour' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#contact"
              onMouseEnter={() => onHoverItem?.('TALK')}
              onMouseLeave={onLeaveItem}
              className="inline-flex h-10 items-center rounded-full border border-white/15 bg-white/10 px-5 font-mono text-[11px] uppercase tracking-[0.15em] text-white transition-all hover:bg-white hover:text-[#10131a]"
            >
              {lang === 'fr' ? 'Contact' : "Let's Talk"}
            </a>

            <button
              onClick={onClose}
              onMouseEnter={() => onHoverItem?.('MENU')}
              onMouseLeave={onLeaveItem}
              aria-label={lang === 'fr' ? 'Fermer la fiche projet' : 'Close project sheet'}
              className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white px-5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#10131a] transition-all hover:bg-slate-200"
            >
              {lang === 'fr' ? 'Fermer' : 'Menu'}
            </button>
          </div>
        </div>

        <div className="relative z-10 grid gap-8 px-5 pb-8 sm:px-8 sm:pb-10 xl:grid-cols-[0.42fr_0.58fr] xl:items-end">
          <div className="space-y-8 pb-2 text-white">
            <div className="space-y-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#ff7a3f]">
                {project.category}
              </span>
              <h1 className="font-display text-5xl leading-[0.9] tracking-tight text-[#f2f4ff] sm:text-6xl xl:text-[5.2rem]">
                {project.title}
              </h1>
            </div>

            <p className="max-w-[40ch] text-sm leading-relaxed text-white/72 sm:text-base">
              {project.description}
            </p>

            <div className="grid grid-cols-2 gap-6 text-sm text-white/85">
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff7a3f]">
                  {lang === 'fr' ? 'Services' : 'Services'}
                </div>
                <ul className="space-y-1.5">
                  {primaryServices.map((service, idx) => (
                    <li key={`service-${idx}`} className="text-white/75">{service}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff7a3f]">
                  {lang === 'fr' ? 'Liens' : 'Links'}
                </div>
                <div className="space-y-1.5">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      onMouseEnter={() => onHoverItem?.('LIVE')}
                      onMouseLeave={onLeaveItem}
                      className="block text-white/75 transition-colors hover:text-white"
                    >
                      {lang === 'fr' ? 'Site live' : 'Live website'}
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      onMouseEnter={() => onHoverItem?.('CODE')}
                      onMouseLeave={onLeaveItem}
                      className="block text-white/75 transition-colors hover:text-white"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>

            <a
              href={project.liveUrl || project.githubUrl || '#'}
              target={project.liveUrl || project.githubUrl ? '_blank' : undefined}
              rel={project.liveUrl || project.githubUrl ? 'noreferrer' : undefined}
              onMouseEnter={() => onHoverItem?.('OPEN')}
              onMouseLeave={onLeaveItem}
              className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#10131a] transition-all hover:bg-slate-200"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-[#ff7a3f]" />
              <span>{projectActionLabel}</span>
            </a>
          </div>

          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/30 shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
              <div className="relative aspect-[16/10] sm:aspect-[16/9]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,24,0.06)_0%,rgba(7,11,24,0.46)_100%)]" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#ff7a3f]">
              <span>{lang === 'fr' ? 'Scroll pour explorer' : 'Scroll to explore'}</span>
              <span>››</span>
            </div>

            {project.metrics && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.metrics.map((metric, idx) => (
                  <div
                    key={`metric-${idx}`}
                    className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3"
                  >
                    <div className="font-mono text-lg text-white sm:text-2xl">{metric.value}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/55">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
