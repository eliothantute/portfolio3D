import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, Gauge, X, ChevronUp, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface TechInspectorHUDProps {
  lang: Language;
}

export const TechInspectorHUD: React.FC<TechInspectorHUDProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.6);
  const [memoryMB, setMemoryMB] = useState<number | null>(null);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    let lastRenderTime = performance.now();

    const loop = (currentTime: number) => {
      frameCountRef.current++;
      const delta = currentTime - lastRenderTime;
      lastRenderTime = currentTime;

      // Update frame time in ms
      if (delta > 0) {
        setFrameTime(Math.round(delta * 10) / 10);
      }

      // Calculate FPS every 500ms
      if (currentTime - lastTimeRef.current >= 500) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        setFps(Math.min(calculatedFps, 144)); // Cap display at refresh rate
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;

        // Check performance memory if supported
        const perf = window.performance as any;
        if (perf && perf.memory && perf.memory.usedJSHeapSize) {
          setMemoryMB(Math.round(perf.memory.usedJSHeapSize / (1024 * 1024)));
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const isHealthyFps = fps >= 55;

  return (
    <aside aria-label={lang === 'fr' ? "Moniteur de performance technique" : "Technical performance monitor"} className="fixed bottom-6 right-6 z-50 select-none font-mono">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-80 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isHealthyFps ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isHealthyFps ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  {lang === 'fr' ? 'PERFORMANCE ENGINE' : 'ENGINE MONITOR'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label="Close Inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {/* FPS Counter */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Gauge className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                  <span className="text-[10px] uppercase font-semibold">Framerate</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-urbanist text-2xl font-black text-zinc-950 dark:text-white">
                    {fps}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">FPS</span>
                </div>
                <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isHealthyFps ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                  {isHealthyFps ? 'Target 60 FPS' : 'Compensating'}
                </span>
              </div>

              {/* Frame Time */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Activity className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                  <span className="text-[10px] uppercase font-semibold">Frame Time</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-urbanist text-2xl font-black text-zinc-950 dark:text-white">
                    {frameTime}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">ms</span>
                </div>
                <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  &lt; 16.7ms Budget
                </span>
              </div>

              {/* WebGL Architecture */}
              <div className="col-span-2 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <Cpu className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                    <span className="text-[10px] uppercase font-semibold">Pipeline 3D / WebGL</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Three.js r185
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="rounded-md border border-zinc-200/60 bg-white px-2 py-0.5 text-zinc-700 font-medium dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    R3F + Drei
                  </span>
                  <span className="rounded-md border border-zinc-200/60 bg-white px-2 py-0.5 text-zinc-700 font-medium dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Lenis Smooth
                  </span>
                  <span className="rounded-md border border-zinc-200/60 bg-white px-2 py-0.5 text-zinc-700 font-medium dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    GSAP Ticker
                  </span>
                  <span className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-zinc-900 font-bold dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                    GLSL Shaders
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <span>{memoryMB ? `Heap: ~${memoryMB} MB` : 'GPU Acceleration Active'}</span>
              <span className="text-zinc-900 dark:text-white font-bold">Eliot Lab • 2026</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/90 px-4 py-2 text-xs font-semibold text-zinc-800 shadow-xl backdrop-blur-xl transition-all hover:border-zinc-400 hover:scale-105 active:scale-95 cursor-pointer dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:border-white/30"
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isHealthyFps ? 'bg-emerald-400' : 'bg-rose-500'}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${isHealthyFps ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </span>
        <span className="font-mono text-[11px] font-bold tracking-wider">
          {fps} FPS
        </span>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
          DEV HUD
        </span>
        <ChevronUp className={`h-3 w-3 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
};
