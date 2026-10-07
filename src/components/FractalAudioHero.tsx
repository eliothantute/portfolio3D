import React, { useEffect, useRef } from 'react';
import { ParticlesSwarm } from '../three/ParticlesSwarm';

interface FractalAudioHeroProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  className?: string;
}

export const FractalAudioHero: React.FC<FractalAudioHeroProps> = ({ analyserRef, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const swarmRef = useRef<InstanceType<typeof ParticlesSwarm> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const swarm = new ParticlesSwarm(container, 14000);
    swarmRef.current = swarm;

    const handleResize = () => swarm.resize(container.clientWidth, container.clientHeight);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // The shared audio graph only exists once the visitor presses play
    // (browser autoplay policy), so poll until it's available.
    const audioPoll = window.setInterval(() => {
      if (analyserRef.current) {
        swarm.bindAnalyser(analyserRef.current);
      }
    }, 500);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      swarm.setPointerNDC(ndcX, ndcY);
    };
    const handlePointerLeave = () => swarm.clearPointer();

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.clearInterval(audioPoll);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      swarm.dispose();
      swarmRef.current = null;
    };
  }, [analyserRef]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing ${className}`}
    />
  );
};
