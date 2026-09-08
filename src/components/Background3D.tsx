import React, { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AudioSphere } from './AudioSphere';

interface Background3DProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isIntroActive?: boolean;
}

function ResponsiveSphere({ analyserRef }: { analyserRef: React.MutableRefObject<AnalyserNode | null> }) {
  const { viewport } = useThree();
  const isMobile = viewport.width < 6.5;

  // Position sphere on the right on desktop, or centered below headline on mobile
  const position: [number, number, number] = isMobile
    ? [0, 0.4, -1.2]
    : [Math.min(viewport.width * 0.24, 2.3), 0.05, -0.9];
  const scale = isMobile ? 0.75 : 1.18;

  return (
    <group position={position} scale={scale}>
      <AudioSphere analyserRef={analyserRef} quality="high" />
    </group>
  );
}

export const Background3D: React.FC<Background3DProps> = ({ analyserRef }) => {
  const [opacity, setOpacity] = useState(1);

  // Gracefully fade out 3D sphere as user scrolls into lower sections for maximum clarity
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const calculatedOpacity = Math.max(0, Math.min(1, 1 - scrollY / 460));
      setOpacity(calculatedOpacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        opacity,
        visibility: opacity <= 0.01 ? 'hidden' : 'visible',
        transition: 'opacity 0.25s ease-out',
      }}
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 44 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 6, 4]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-5, -3, -2]} intensity={0.6} color="#3b82f6" />

        <ResponsiveSphere analyserRef={analyserRef} />
      </Canvas>
    </div>
  );
};
