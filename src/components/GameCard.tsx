import React, { ReactNode } from 'react';

interface GameCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success';
  unlocked?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  children,
  className = '',
  variant = 'primary',
  unlocked = true
}) => {
  const variants = {
    primary: 'border-[#00ff88]/50 hover:border-[#00ff88] hover:shadow-lg hover:shadow-[#00ff88]/20',
    secondary: 'border-[#ff00ff]/50 hover:border-[#ff00ff] hover:shadow-lg hover:shadow-[#ff00ff]/20',
    success: 'border-[#00ffff]/50 hover:border-[#00ffff] hover:shadow-lg hover:shadow-[#00ffff]/20'
  };

  const textColors = {
    primary: 'text-[#00ff88]',
    secondary: 'text-[#ff00ff]',
    success: 'text-[#00ffff]'
  };

  return (
    <div
      className={`
        group relative p-6 border-2 rounded-none
        bg-gradient-to-br from-black/80 to-black/40
        backdrop-blur-sm
        transition-all duration-300
        ${unlocked ? variants[variant] : 'border-[#404040] opacity-50'}
        ${!unlocked ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Locked Badge */}
      {!unlocked && (
        <div className="absolute top-2 right-2 text-[#ff0000] text-xs font-mono tracking-widest">
          🔒 LOCKED
        </div>
      )}

      {/* Corner Accents */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-current opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-current opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-current opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-current opacity-50 group-hover:opacity-100 transition-opacity" />

      {/* Title */}
      <h3 className={`text-lg font-mono font-bold tracking-wider mb-3 ${textColors[variant]}`}>
        ▶ {title}
      </h3>

      {/* Content */}
      <div className="text-sm text-gray-300 font-mono">
        {children}
      </div>
    </div>
  );
};
