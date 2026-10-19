import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Project, Language } from '../types';

interface ProjectsGridProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Clean 2-column grid, Lusion-style: big rounded image that scales in on
// hover, a dot-separated tag line, and a title that reveals a leading arrow
// on hover.
export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects, lang, onSelectProject, onHoverItem, onLeaveItem }) => {
  if (projects.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-y-16">
      {projects.map((project, index) => {
        const tags = (project.role ?? []).filter(Boolean).slice(0, 4);

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: (index % 2) * 0.08, ease: EASE }}
            className="group cursor-pointer"
            onClick={() => {
              if (project.liveUrl || project.githubUrl) {
                window.open(project.liveUrl || project.githubUrl, '_blank', 'noopener,noreferrer');
              } else {
                onSelectProject(project);
              }
            }}
            onMouseEnter={() => onHoverItem?.(project.title.toUpperCase())}
            onMouseLeave={onLeaveItem}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-900 sm:aspect-[16/12] sm:rounded-[2rem]">
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
            </div>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-500 sm:text-xs">
              {tags.join(' • ')}
            </p>

            <div className="mt-1.5 flex items-center overflow-hidden">
              <span className="flex items-center gap-2">
                <ArrowUpRight className="h-0 w-0 shrink-0 -translate-x-2 scale-50 opacity-0 transition-all duration-300 ease-out group-hover:h-[0.8em] group-hover:w-[0.8em] group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 sm:group-hover:h-[0.75em] sm:group-hover:w-[0.75em]" />
                <h3 className="font-urbanist text-2xl font-bold tracking-tight text-zinc-950 transition-transform duration-300 ease-out dark:text-white sm:text-3xl">
                  {project.title}
                </h3>
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
