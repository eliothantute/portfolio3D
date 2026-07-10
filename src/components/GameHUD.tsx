import React, { useState, useEffect } from 'react';
import { Zap, Shield, Code2, Palette } from 'lucide-react';

interface GameHUDProps {
  currentLevel?: number;
  totalLevels?: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ currentLevel = 1, totalLevels = 5 }) => {
  const [time, setTime] = useState<string>('00:00');
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <>
      {/* Top HUD Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="h-12 bg-gradient-to-b from-[rgba(0,0,0,0.8)] to-transparent border-b border-[#00ff88]/20 backdrop-blur-md">
          <div className="flex justify-between items-center h-full px-6 text-xs font-mono tracking-widest">
            {/* Left Section */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#00ff88] animate-pulse" />
                <span className="text-[#00ff88]">PWR: 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#ff00ff] animate-pulse" />
                <span className="text-[#ff00ff]">LVL: {currentLevel}/{totalLevels}</span>
              </div>
            </div>

            {/* Center - System Status */}
            <div className={`text-[#00ffff] ${glitch ? 'animate-glitch' : ''}`}>
              SYSTEM_ONLINE /// ELIOT.HANTUTE / v2.0
            </div>

            {/* Right Section */}
            <div className="text-[#ffff00]">
              TIME: {time}
            </div>
          </div>
        </div>

        {/* Scanlines */}
        <div className="absolute inset-x-0 top-12 h-16 pointer-events-none opacity-10">
          <div className="absolute inset-0 bg-repeat scanlines" />
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="h-12 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent border-t border-[#ff00ff]/20 backdrop-blur-md">
          <div className="flex justify-between items-center h-full px-6 text-xs font-mono tracking-widest">
            {/* Skills Display */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-[#00ff88]" />
                <span className="text-[#00ff88]">DEV</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-[#ff00ff]" />
                <span className="text-[#ff00ff]">DESIGN</span>
              </div>
            </div>

            {/* Mission Status */}
            <div className="text-[#00ffff]">
              ► PORTFOLIO_EXPLORATION_ACTIVE
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-[#ffff00]">PROGRESS</span>
              <div className="w-24 h-1 bg-[rgba(0,255,136,0.2)] rounded-full border border-[#00ff88]/40">
                <div className="h-full w-1/2 bg-gradient-to-r from-[#00ff88] to-[#00ffff] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vignette Effect */}
      <div className="fixed inset-0 pointer-events-none z-30 bg-radial-gradient to-transparent opacity-30" />
    </>
  );
};
