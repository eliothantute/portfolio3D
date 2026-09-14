import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getParticleControls,
  setParticleControl,
  resetParticleControls,
  subscribeParticleControls,
  ParticleControls,
} from '../state/particleControls';
import { Sliders, RotateCcw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ParticleHUDProps {
  lang: 'fr' | 'en';
}

export const ParticleHUD: React.FC<ParticleHUDProps> = ({ lang }) => {
  const [controls, setControls] = useState<ParticleControls>(getParticleControls());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return subscribeParticleControls((updated) => {
      setControls({ ...updated });
    });
  }, []);

  return (
    <div className="pointer-events-auto w-full max-w-sm">
      {/* HUD Header Toggle Button */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-950 opacity-75 dark:bg-white" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-950 dark:bg-white" />
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Hyper-Dimensional Tesseract 4D
            </span>
            <span className="font-mono text-[9px] text-zinc-400">
              24,000 PARTICULES // 60 FPS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-7 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 text-[10px] font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            title={lang === 'fr' ? 'Contrôles de l’essaim 3D' : '3D Swarm Controls'}
          >
            <Sliders className="h-3 w-3" />
            <span>{isOpen ? (lang === 'fr' ? 'Fermer' : 'Close') : (lang === 'fr' ? 'Ajuster' : 'Tune')}</span>
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Expandable Real-Time Slider Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/95"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                {lang === 'fr' ? 'Paramètres Algorithmiques' : 'Algorithmic Parameters'}
              </span>
              <button
                type="button"
                onClick={resetParticleControls}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                title="Reset default values"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Slider 1: Scale */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {lang === 'fr' ? 'Échelle' : 'Scale'}
                  </span>
                  <span className="font-bold text-zinc-950 dark:text-white">
                    {controls.scale.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={controls.scale}
                  onChange={(e) => setParticleControl('scale', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:bg-zinc-800 dark:accent-white"
                />
              </div>

              {/* Slider 2: Twist */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {lang === 'fr' ? 'Torsion Vortex' : 'Vortex Twist'}
                  </span>
                  <span className="font-bold text-zinc-950 dark:text-white">
                    {controls.twist.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={controls.twist}
                  onChange={(e) => setParticleControl('twist', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:bg-zinc-800 dark:accent-white"
                />
              </div>

              {/* Slider 3: Speed */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {lang === 'fr' ? 'Vitesse' : 'Speed'}
                  </span>
                  <span className="font-bold text-zinc-950 dark:text-white">
                    {controls.speed.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={controls.speed}
                  onChange={(e) => setParticleControl('speed', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:bg-zinc-800 dark:accent-white"
                />
              </div>

              {/* Slider 4: Chaos */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {lang === 'fr' ? 'Turbulence' : 'Turbulence'}
                  </span>
                  <span className="font-bold text-zinc-950 dark:text-white">
                    {controls.chaos.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={controls.chaos}
                  onChange={(e) => setParticleControl('chaos', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:bg-zinc-800 dark:accent-white"
                />
              </div>
            </div>

            <p className="mt-3 text-[10px] text-zinc-400 font-mono leading-tight">
              {lang === 'fr'
                ? "Contrôle en direct de l'algorithme d'attracteur 4D à 24 000 particules."
                : "Real-time control of the 24,000-particle 4D attractor algorithm."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
