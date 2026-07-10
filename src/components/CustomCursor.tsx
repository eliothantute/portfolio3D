import React, { useEffect, useState } from 'react';

interface CustomCursorProps {
  cursorText: string;
  isHovered: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ cursorText, isHovered }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Vérifier si desktop
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Animation lissée du ring (raf)
  useEffect(() => {
    let animationFrameId: number;
    const animateRing = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.18,
        y: prev.y + (pos.y - prev.y) * 0.18,
      }));
      animationFrameId = requestAnimationFrame(animateRing);
    };
    animateRing();
    return () => cancelAnimationFrame(animationFrameId);
  }, [pos]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Dot central ultra réactif */}
      <div
        className="fixed pointer-events-none z-[10000] rounded-full bg-[#ff571a] transition-transform duration-75 ease-out flex items-center justify-center"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isHovered || cursorText ? '12px' : '6px',
          height: isHovered || cursorText ? '12px' : '6px',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 15px rgba(255, 87, 26, 0.8)',
        }}
      />

      {/* Ring magnétique avec texte contextuel */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full flex items-center justify-center transition-all duration-300 ease-out border ${
          isHovered || cursorText
            ? 'border-[#ff571a] bg-[#ff571a]/15 backdrop-blur-[2px] shadow-[0_0_30px_rgba(255,87,26,0.4)] scale-100'
            : 'border-white/30 bg-transparent scale-100 opacity-60'
        }`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          width: cursorText ? '80px' : isHovered ? '56px' : '36px',
          height: cursorText ? '80px' : isHovered ? '56px' : '36px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {cursorText && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white animate-pulse">
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
};
