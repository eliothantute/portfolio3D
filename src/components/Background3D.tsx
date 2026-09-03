import React from 'react';
import { Canvas } from '@react-three/fiber';
import { AudioSphere } from './AudioSphere';

interface Background3DProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isIntroActive?: boolean;
}

export const Background3D: React.FC<Background3DProps> = ({ analyserRef }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 5, 3]} intensity={1.0} color="#ffffff" />

        {/* Clean, highly detailed starling murmuration particle sphere */}
        <group position={[0, 0.1, -1.2]} scale={1.38}>
          <AudioSphere analyserRef={analyserRef} quality="high" />
        </group>
      </Canvas>
    </div>
  );
};
