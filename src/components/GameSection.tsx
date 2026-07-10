import React, { ReactNode } from 'react';

interface GameSectionProps {
  title: string;
  levelNumber: number;
  children: ReactNode;
  className?: string;
  completed?: boolean;
}

export const GameSection: React.FC<GameSectionProps> = ({
  title,
  levelNumber,
  children,
  className = '',
  completed = false
}) => {
  return (
    <section className={`relative py-16 px-4 md:px-8 ${className}`}>
      {/* Level Header */}
      <div className="mb-12 border-b border-[#00ff88]/30 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-[#00ff88] font-mono text-sm tracking-widest">
            {'['}LEVEL_{levelNumber}{']'}
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-[#00ff88]/50 to-transparent" />
          {completed && (
            <div className="text-[#00ff88] font-mono text-xs tracking-widest animate-pulse">
              ✓ COMPLETED
            </div>
          )}
        </div>

        <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00ffff] to-[#ff00ff]">
          {title}
        </h2>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Level Footer */}
      <div className="mt-8 pt-6 border-t border-[#ff00ff]/20">
        <div className="flex justify-between items-center text-xs font-mono text-[#ffff00] opacity-60">
          <span>LEVEL_{levelNumber}_COMPLETE</span>
          <span>PROGRESS_SAVED</span>
        </div>
      </div>
    </section>
  );
};
