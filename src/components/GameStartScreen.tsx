import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface GameStartScreenProps {
  onStart: () => void;
}

export const GameStartScreen: React.FC<GameStartScreenProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 600);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();

    // Title appears with glitch effect
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 40, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power4.out' }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.8'
      )
      .fromTo(
        buttonRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' },
        '-=0.6'
      );

    // Continuous scan effect
    gsap.to(scanRef.current, {
      yPercent: 100,
      duration: 4,
      repeat: -1,
      ease: 'none'
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff00ff]/10 via-black to-[#00ffff]/10" />

      {/* Scanlines effect */}
      <div ref={scanRef} className="absolute inset-0 scanlines-animation opacity-20" />

      {/* Content */}
      <div className="relative z-10 text-center px-8">
        {/* Glitch Title */}
        <div ref={titleRef} className="mb-8">
          <h1 className="text-6xl md:text-8xl font-black font-display tracking-tighter leading-none mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00ffff] to-[#ff00ff] animate-pulse">
              ELIOT.HQ
            </span>
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-[#00ff88] to-[#00ffff] glitch-animation" />
        </div>

        {/* Subtitle with terminal effect */}
        <div ref={subtitleRef} className="mb-16">
          <p className="text-lg md:text-xl text-[#00ffff] font-mono tracking-widest mb-2">
            ▶ PORTFOLIO_EXPERIENCE_V2.0
          </p>
          <p className="text-sm text-[#ffff00] font-mono">
            // Bienvenue dans l'interface de jeu
          </p>
        </div>

        {/* Start Button */}
        <button
          ref={buttonRef}
          onClick={onStart}
          className="relative px-12 py-4 text-xl font-mono font-bold tracking-widest group"
        >
          {/* Button Border Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff00ff] to-[#00ffff] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg" />

          {/* Button Content */}
          <div className="relative bg-black border-2 border-[#00ff88] px-8 py-3 text-[#00ff88] group-hover:text-black group-hover:bg-[#00ff88] transition-all duration-300 transform group-hover:scale-105">
            <span className="inline-block mr-2">{blink ? '▶' : '▮'}</span>
            ENTRER_DANS_LE_JEU
            <span className="inline-block ml-2">{blink ? '◀' : '▮'}</span>
          </div>
        </button>

        {/* Footer Text */}
        <div className="mt-12 text-xs text-[#ff00ff] font-mono tracking-widest opacity-60 animate-pulse">
          © 2024 ELIOT.HANTUTE / PRESS_START_TO_CONTINUE
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-4 left-4 text-[#00ff88] font-mono text-sm opacity-40">
        ◢ INITIALIZING...
      </div>
      <div className="absolute bottom-4 right-4 text-[#ff00ff] font-mono text-sm opacity-40">
        v2.0 STABLE ◣
      </div>
    </div>
  );
};
